## ge.js ##
class Game
  constructor: (conf) ->
    canvas =  document.getElementById conf.CANVAS_NAME
    @g = canvas.getContext '2d'
    @config = conf
    canvas.width = conf.WINDOW_WIDTH;
    canvas.height = conf.WINDOW_HEIGHT;
    @keys =
        left : 0
        right : 0
        up : 0
        down : 0
    @mouse = x : 0, y : 0
    @scenes =
      "Opening": new OpeningScene()
      "Field": new FieldScene()
    @curr_scene = @scenes["Opening"]

  enter: ->
    next_scene = @curr_scene.process(@keys,@mouse)
    if next_scene != @curr_scene.name
      # `var func = function(str) {console.log(str);};`
      console.log @curr_scene.name+" to "+next_scene
      `this.curr_scene = this.scenes["Field"];`
      return
    @draw(@curr_scene)

  start: (self) ->
    setInterval ->
      self.enter()
    , 1000 / @config.FPS

  getkey: (self,which,to) ->
    switch which
      when 68,39 then self.keys.right = to
      when 65,37 then self.keys.left = to
      when 87,38 then self.keys.up = to
      when 83,40 then self.keys.down = to
      when 32 then self.keys.space = to
      when 17 then self.keys.ctrl = to

  draw: (scene) ->
    @g.clearRect(0,0,@config.WINDOW_WIDTH ,@config.WINDOW_HEIGHT)
    @g.save()
    scene.render(@g)
    @g.restore()

my =
  distance: (x1,y1,x2,y2)->
    xd = Math.pow (x1-x2) ,2
    yd = Math.pow (y1-y2) ,2
    return Math.sqrt xd+yd

  init_cv: (g,color="rgb(255,255,255)",alpha=1)->
    g.beginPath()
    g.strokeStyle = color
    g.fillStyle = color
    g.globalAlpha = alpha

  gen_map:(x,y)->
    map = []
    for i in [0..20]
        map[i] = []
        for j in [0..15]
            if Math.random() > 0.5
                map[i][j] = 0
            else
                map[i][j] = 1
    return map

  draw_line: (g,x1,y1,x2,y2)->
    g.moveTo(x1,y1)
    g.lineTo(x2,y2)
    g.stroke()

  color: (r=255,g=255,b=255,name=null)->
    switch name
        when "red" then return @color(255,0,0)
        when "green" then return @color(0,255,0)
        when "blue" then return @color(0,0,255)
        when "white" then return @color(255,255,255)
        when "black" then return @color(0,0,0)
        when "grey" then return @color(128,128,128)
    return "rgb("+~~(r)+","+~~(g)+","+~~(b)+")"

  draw_cell: (g,x,y,cell,color="grey")->
    g.moveTo(x , y)
    g.lineTo(x+cell , y)
    g.lineTo(x+cell , y+cell)
    g.lineTo(x , y+cell)
    g.lineTo(x , y)
    g.fill()

  render_rest_gage:( g, x , y, w, h ,percent=1) ->
    # frame
    g.moveTo(x-w/2 , y-h/2)
    g.lineTo(x+w/2 , y-h/2)
    g.lineTo(x+w/2 , y+h/2)
    g.lineTo(x-w/2 , y+h/2)
    g.lineTo(x-w/2 , y-h/2)
    g.stroke()

    # rest
    g.beginPath()
    g.moveTo(x-w/2 +1, y-h/2+1)
    g.lineTo(x-w/2+w*percent, y-h/2+1)
    g.lineTo(x-w/2+w*percent, y+h/2-1)
    g.lineTo(x-w/2 +1, y+h/2-1)
    g.lineTo(x-w/2 +1, y-h/2+1)
    g.fill()

class Status
  constructor: (params = {}, @lv = 1) ->
    @MAX_HP = params.hp or 30
    @hp = @MAX_HP
    @MAX_WT = params.wt or 10
    @wt = 0
    @atk = params.atk or 10
    @def = params.def or 1.0
    @res = params.res or 1.0

class Sprite
  constructor: (@x,@y) ->
    @speed = 5

  render: (g)->
    g.beginPath()
    ms = parseInt(new Date()/100) % 10
    ms = 10 - ms if ms > 5
    g.arc(@x,@y, 15 - ms ,0,Math.PI*2,true)
    g.stroke()

  get_distance: (target)->
    xd = Math.pow (@x-target.x) ,2
    yd = Math.pow (@y-target.y) ,2
    return Math.sqrt xd+yd

class Battler extends Sprite
  constructor: () ->
    @status = new Status()

  atack: (target)->
    target.status.hp -= @status.atk * target.status.def
    if target.status.hp <= 0
        target.alive = false

  _render_gages:(g,x,y,w,h,rest) ->
    # HP bar
    my.init_cv(g,"rgb(0, 250, 100)")
    my.render_rest_gage(g,x,y+15,w,h,@status.hp/@status.MAX_HP)

    # WT bar
    my.init_cv(g,"rgb(0, 100, 255)")
    my.render_rest_gage(g,x,y+25,w,h,@status.wt/@status.MAX_WT)

class Player extends Battler
  constructor: (@x,@y) ->
    super()
    status =
      hp : 120
      wt : 20
      atk : 10
      def: 0.5
    @status = new Status(status)
    @active = false

    @speed = 6
    @scale = 10
    @beat = 20
    @atack_range = 50

    @_rotate = 0
    @_fontsize = 10
    @dir = 0
    @vx = 0
    @vy = 0

  process: (keys,mouse)->
    s = keys.right+keys.left+keys.up+keys.down
    if s > 1
      move = @speed * Math.sqrt(2)/2
    else
      move = @speed
    if keys.right
      @x += move
      @vx -= move
    if keys.left
      @x -= move
      @vx += move
    if keys.up
      @y -= move
      @vy += move
    if keys.down
      @y += move
      @vy -= move

    @dir = Math.atan( (320 - mouse.y) / (240 - mouse.x)  )


  render: (g)->

    # baet icon
    my.init_cv(g,"rgb(0, 0, 162)")
    ms = ~~(new Date()/100) % @beat / @beat
    ms = 1 - ms if ms > 0.5
    g.arc(320,240, ( 1.3 - ms ) * @scale ,0,Math.PI*2,true)
    g.stroke()

    @_rotate += Math.PI * 0.1
    my.init_cv(g,"rgb(128, 100, 162)")
    g.arc(320,240, @scale * 0.5,  @_rotate ,Math.PI+@_rotate,true)
    g.stroke()

    my.init_cv(g,"rgb(255, 0, 0)")
    g.arc(320,240, @atack_range ,  0 , Math.PI*2,true)
    g.stroke()
    @_render_gages(g,320,240,40,6,@status.hp/@status.MAX_HP)

class Enemy extends Battler
  constructor: (@x,@y) ->
    status =
      hp : 50
      wt : 22
      atk : 10
      def: 1.0
    @status = new Status(status)
    @active = false

    @alive = true
    @atack_range = 20
    @sight_range = 80

    @speed = 6
    @dir = 0

    @_fontsize = 10
    @scale = 5
    @beat = 10
    @_alive_color = 'rgb(255, 255, 255)'
    @_dead_color = 'rgb(55, 55, 55)'
    @cnt = ~~(Math.random() * 24)


  process: (player)->
    @cnt += 1
    if @alive
        # tracing
        distance = @get_distance(player)
        if distance < @sight_range # in sight
            @active = true
        else  # when not in sight
            @active = false

        if @active
            if distance > @atack_range
                @x -= @speed/2 if @x > player.x
                @x += @speed/2 if @x < player.x
                @y += @speed/2 if @y < player.y
                @y -= @speed/2 if @y > player.y
            else
                @status.wt += 1
                if @status.wt >= @status.MAX_WT
                    @atack(player)
                    @status.wt = 0
        else
            if @cnt % 24 ==  0
                @dir = Math.PI * 2 * Math.random()
            if @cnt % 24 < 8
                @x += @speed * Math.cos(@dir)
                @y += @speed * Math.sin(@dir)
  render: (g,player)->
    my.init_cv(g)
    if @alive
        g.fillStyle = @_alive_color
        ms = ~~(new Date()/100) % @beat / @beat
        ms = 1 - ms if ms > 0.5
        g.arc(@x + player.vx,@y + player.vy, ( 1.3 - ms ) * @scale ,0,Math.PI*2,true)
        g.fill()

        # active circle
        if @active
            my.init_cv(g , color = "rgb(255,0,0)")
            g.arc(@x + player.vx,@y + player.vy, @scale*0.4 ,0,Math.PI*2,true)
            g.fill()

        # sight circle
        my.init_cv(g , color = "rgb(50,50,50)",alpha=0.3)
        g.arc(@x + player.vx,@y + player.vy, @sight_range ,0,Math.PI*2,true)
        g.stroke()

        # my.init_cv(g,"rgb(255, 100, 100)")
        # my.render_rest_gage(g , @x+player.vx , @y+player.vy+15 ,30,6,@status.hp/@status.MAX_HP)
        # my.init_cv(g,"rgb(0, 100, 255)")
        @_render_gages(g , @x+player.vx , @y+player.vy ,30,6,@status.wt/@status.MAX_WT)
    else
        g.fillStyle = @_dead_color
        g.arc(@x + player.vx,@y + player.vy, @scale ,0,Math.PI*2,true)
        g.fill()
class Scene
  constructor: (@name) ->

  process: (keys,mouse) ->
    return @name

  render: (g)->
    @player.render(g)
    g.fillText(
        @name,
        300,200)


class OpeningScene extends Scene
  constructor: () ->
    super("Opening")
    @player  =  new Player(320,240)

  process: (keys,mouse) ->
    if keys.right
      return "Filed"
    return @name

  render: (g)->
    @player.render(g)
    g.fillText(
        "Opening",
        300,200)

class FieldScene extends Scene
  constructor: () ->
    super("Field")
    @player  =  new Player(320,240)
    @enemies = (new Enemy(Math.random()*640, Math.random()*480) for i in [1..30])
    @map = my.gen_map(20,15)

  process: (keys,mouse) ->
    @player.process(keys,mouse)
    @player.active = false
    # pst = @player.status

    # collision
    for n in [0..(@enemies.length-1)]
      enemy = @enemies[n]
      enemy.process(@player)

      d = my.distance( @player.x,@player.y,enemy.x,enemy.y )
      if d < @player.atack_range and enemy.alive
        if @player.status.MAX_WT >  @player.status.wt
          # @player.status.wt += 1
          @player.active = true

        else if @player.status.MAX_WT <= @player.status.wt
          @player.status.wt = 0
          @player.atack(enemy)

    if @player.active and @player.status.wt < @player.status.MAX_WT
      @player.status.wt += 1
    else
      @player.status.wt = 0
    return @name

  render: (g)->
    enemy.render(g,@player) for enemy in @enemies
    @player.render(g)
    cell = 32
    my.init_cv(g,color="rgb(255,255,255)")
    g.font = "10px "+"mono"
    g.fillText(
        "HP "+@player.status.hp+"/"+@player.status.MAX_HP,
        15,15)

    for i in [0..@map.length-1]
        for j in [0..@map[i].length-1]
            if @map[i][j]
                my.init_cv(g,color="rgb(100,100,100)",alpha=0.3)
            else
                my.init_cv(g,color="rgb(0,0,0)",alpha=0.3)
            my.draw_cell(g,
                @player.vx+i*cell,@player.vy+j*cell,
                cell)
vows = require 'vows'
assert = require 'assert'

vows.describe('Hoge').addBatch
  'a instance':
    topic: "Main"
    'test': ()->
      assert.equal 1 , 1
.export module
