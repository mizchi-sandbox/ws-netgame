Skill = require('./skills')
{Weapons} = require('./equip')
{random,sqrt,min,max,sin,cos} = Math
{Sprite} = require('./sprites')
{ObjectId} = require('./ObjectId')
{randint} = require('./Util')

class Character extends Sprite
  scale : null

  constructor: (@scene , @x=0,@y=0,@group=ObjectId.Enemy ,status={}) ->
    super @x, @y
    @keys = {}
    @target = null
    @dir = 0
    @id = ~~(random() * 1000)
    @cnt = ~~(random() * 60)
    @_items_ = []

    @animation = []
    @_path = []

  update:(objs)->
    @cnt++
    if @is_alive()
      @affected()
      target = @recognize(objs)
      @action(target)

  affected:()->
    @check(@status)
    @regenerate() if @cnt%30 == 0

  recognize: (objs)->
    @search objs
    @select_skill()
    return objs

  action:(target)->
    @move()
    @selected_skill.update(target)


  # affected
  check:(st)->
    st.hp = st.MAX_HP if st.hp > st.MAX_HP
    st.hp = 0 if st.hp < 0
    if @is_alive()
      if @target?.is_dead()
         @target = null
    else
      @target = null

  regenerate: ()->
    r = (if @target then 2 else 1)
    if @status.hp < @status.MAX_HP
      @status.hp += 1

  # recognize
  search : (objs)->
    enemies = @find_obj(ObjectId.get_enemy(@),objs,@status.sight_range)
    if @target
      if @target.is_dead() or @get_distance(@target) > @status.sight_range*1.5
        console.log "#{@name} lost track of #{@target.name}"
        @target = null
    else if enemies.length > 0
      @target = enemies.first()
      console.log "#{@name} find #{@target.name}"

  select_skill: ()->
    @selected_skill = new Skill.Skill_Atack(@)

  # action
  is_waiting : ()->
    if @target
      @set_dir(@target.x,@target.y)
      return true if @get_distance(@target) < @selected_skill.range
    else if @group isnt ObjectId.Player
      return true if @cnt%60 < 15
    return false

  update_path : (fp ,tp )->
    [fx ,fy] = fp
    from = @scene.get_cell(fx ,fy)
    [tx ,ty] = tp
    to = @scene.get_cell( tx ,ty)

    @_path = @scene.search_path( from ,to )
    @to = @_path.shift()

  wander : ()->
    [tx,ty] = @scene.get_cell(@x,@y)
    @to = [tx+randint(-1,1),ty+randint(-1,1)]

  step_forward: (to_x , to_y, wide)->
    @set_dir(to_x,to_y)
    [
      @x + ~~(wide * cos(@dir)),
      @y + ~~(wide * sin(@dir))
    ]

  move: ()->
    return if @is_waiting()

    if @destination
      @update_path( [@x,@y],[@destination.x,@destination.y] )
      @destination = null

    unless @to
      # 優先度 destination(人為設定) > target(ターゲット) > follow(リーダー)
      if @target
        @update_path( [@x,@y],[@target.x,@target.y] )
      else if @follow
        @update_path( [@x,@y],[@follow.x,@follow.y] )
      else
        @wander()

    else
      wide = @status.speed
      [dx,dy] = @scene.get_point(@to[0],@to[1])
      [nx,ny] = @step_forward( dx , dy ,wide)
      if dx-wide<nx<dx+wide and dy-wide<ny<dy+wide
        if @_path.length > 0
          @to = @_path.shift()
        else
          @to = null

    # 衝突判定
    unless @scene.collide( nx,ny )
      @x = nx if nx?
      @y = ny if ny?

    # 引っかかってる場合
    if @x is @_lx_ and @y is @_ly_
      @wander()
      # [cx,cy] = @scene.get_cell(@x,@y)
      # @to = [cx+randint(-1,1),cy+randint(-1,1)]
    @_lx_ = @x
    @_ly_ = @y

  die : (actor)->
    @cnt = 0
    if @group is ObjectId.Enemy
      actor.status.gold += ~~(random()*100)
    actor.status.get_exp(@status.lv*10)
    console.log "#{@name} is killed by #{actor.name}." if actor

  shift_target:(targets)->
    if @target and targets.length > 0
      if not @target in targets
        @target = targets[0]
        return
      else if targets.size() == 1
        @target = targets[0]
        return
      if targets.size() > 1
        cur = targets.indexOf @target
        if cur+1 >= targets.size()
          cur = 0
        else
          cur += 1
        @target = targets[cur]


  equip : (item)->
    if item.at in (k for k,v of @_equips_)
      @_equips_[item.at] = item
    false

  get_item:(item)->
    @_items_.push(item)

  use_item:(item)->
    @_items_.remove(item)

  get_param:(param)->
    (item?[param] or 0 for at,item of @_equips_).reduce (x,y)-> x+y


  add_damage : (actor, amount)->
    before = @is_alive()
    @status.hp -= amount
    @die(actor) if @is_dead() and before
    return @is_alive()



  is_alive:()-> @status.hp > 1
  is_dead:()-> ! @is_alive()

  set_dir: (x,y)->
    rx = x - @x
    ry = y - @y
    if rx >= 0
      @dir = Math.atan( ry / rx  )
    else
      @dir = Math.PI - Math.atan( ry / - rx  )

  add_animation:(animation)->
    @animation.push(animation)

class Goblin extends Character
  name : "Goblin"
  scale : 1
  constructor: (@scene , @x,@y,@group,lv=1) ->
    @id = ObjectId.Monster
    @dir = 0
    @status = new Status {str: 8, int: 4, dex:6},{},1
    super(@scene ,@x,@y,@group,@status)
    @skills =
      one: new Skill.Skill_Atack(@,3)
      two: new Skill.Skill_Heal(@)
    @selected_skill = @skills['one']
    @_equips_ =
      main_hand : new Weapons::Dagger
      sub_hand : null
      body : null

  select_skill: ()->
    if @status.hp < 10
      last = @selected_skill
      @selected_skill = @skills['two']
      if last is @skills['one']
        @selected_skill.ct = 0
    else
      @selected_skill = @skills['one']

  die : (actor)->
    super actor
    actor.get_item new Weapons::Dagger

  exec:(actor,objs)->
    super actor,objs

class Player extends Character
  scale : 8
  constructor: (@scene, @x,@y,param = {},@group=ObjectId.Player) ->
    super(@scene,@x,@y,@group)
    @keys = {}
    @status = new Status {str: 10,int: 10,dex: 10},{}, param.lv,param.exp
    @skills =
      one: new Skill.Skill_Atack(@)
      two: new Skill.Skill_Smash(@)
      three: new Skill.Skill_Heal(@)
      four: new Skill.Skill_Meteor(@)
    @selected_skill = @skills['one']

    @_equips_ =
      main_hand : new Weapons::Blade
      sub_hand : null
      body : null

  select_skill :()->
    for k,v of @keys
      # if v and k in ["zero","one","two","three","four","five","six","seven","eight","nine"]
      if v and k in ["one","two","three","four"]
        return @selected_skill = @skills[k]

  save:()->
  update:(objs)->
    cmap = @scene
    enemies = @find_obj(ObjectId.get_enemy(@),objs,@status.sight_range)
    if @keys.space == 2
      @shift_target(enemies)
    super objs,cmap

  set_destination:(x,y)->
    @target = x:x,y:y,is_dead:(->false),status:{get_param:->}

  wander : ->

  move: ->
    cmap = @scene
    keys = @keys

    sum = 0
    for i in [keys.right , keys.left , keys.up , keys.down]
      sum++ if i

    if sum is 0
      super()
      return
    else if sum > 1
      move = ~~(@status.speed * Math.sqrt(2)/2)
    else
      move = @status.speed

    if keys.right
      if cmap.collide( @x+move , @y )
        @x = (~~(@x/cmap.cell)+1)*cmap.cell-1
      else
        @x += move
    if keys.left
      if cmap.collide( @x-move , @y )
        @x = (~~(@x/cmap.cell))*cmap.cell+1
      else
        @x -= move
    if keys.down
      if cmap.collide( @x , @y-move )
        @y = (~~(@y/cmap.cell))*cmap.cell+1
      else
        @y -= move
    if keys.up
      if cmap.collide( @x , @y+move )
        @y = (~~(@y/cmap.cell+1))*cmap.cell-1
      else
        @y += move


class Status
  constructor: (params = {}, equips = {}, @lv,@exp=0) ->
    @build_status(params,equips)
    @gold = params.gold or 0

    @hp = @MAX_HP
    @sp = 0
    @next_lv = @lv * 50

    @STR = params.str
    @INT = params.int
    @DEX = params.dex

  build_status:(params={},equips)->
    @MAX_HP = params.str*10

    @atk = params.str
    @mgc = params.int
    @def = params.str / 10
    @res = params.int

    @regenerate = ~~(params.str/10)
    @sight_range = params.dex*20
    @speed = ~~(params.dex * 0.5)

  level_up: ()->
    @lv++
    @exp = 0
    @sp++
    @next_lv = @lv * 50
    @build_status str:@STR,int:@INT,dex:@DEX

  get_exp:(point)->
    console.log "get :"+point
    @exp += point
    if @exp >= @next_lv
      @level_up()
      console.log 'level up! to lv.'+@lv

  set_next_exp:()->
    @next_lv = @lv * 30

  onDamaged : (amount)->
  onHealed : (amount)->


exports.Goblin = Goblin
exports.Player = Player
exports.Character = Character
