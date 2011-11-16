Array::remove = (obj)-> @splice(@indexOf(obj),1)
Array::size = ()-> @length
Array::first = ()-> @[0]
Array::last = ()-> @[@length-1]
Array::each = Array::forEach
{cos,sin,sqrt,abs} = Math

Color =
  Red : "rgb(255,0,0)"
  Blue : "rgb(0,0,255)"
  Green : "rgb(0,255,0)"
  White : "rgb(255,255,255)"
  Black : "rgb(0,0,0)"
  i : (r,g,b)->
    "rgb(#{r},#{g},#{b})"

#===== CanvasRenderingContext2D =====
Canvas = CanvasRenderingContext2D
Canvas::init = (color=Color.i(255,255,255),alpha=1)->
  @beginPath()
  @strokeStyle = color
  @fillStyle = color
  @globalAlpha = alpha

Canvas::initText = (size=10,font='Arial')->
  @font = "#{size}pt #{font}"

Canvas::drawLine = (x,y,dx,dy)->
  @moveTo x,y
  @lineTo x+dx,y+dy
  @stroke()
Canvas::drawPath = (fill,path)->
  [sx,sy] = path.shift()
  @moveTo sx,sy
  while path.size() > 0
    [px,py] = path.shift()
    @lineTo px,py
  @lineTo sx,sy
  if fill then @fill() else @stroke()

Canvas::drawDiffPath = (fill,path)->
  [sx,sy] = path.shift()
  @moveTo sx,sy
  [px,py] = [sx,sy]
  while path.size() > 0
    [dx,dy] = path.shift()
    [px,py] = [px+dx,py+dy]
    @lineTo px,py
  @lineTo sx,sy
  if fill then @fill() else @stroke()

Canvas::drawLine = (x,y,dx,dy)->
  @moveTo x,y
  @lineTo x+dx,y+dy
  @stroke()

Canvas::drawDLine = (x1,y1,x2,y2)->
  @moveTo x1,y1
  @lineTo x2,y2
  @stroke()

Canvas::drawArc = (fill , x,y,size,from=0, to=Math.PI*2,reverse=false)->
  @arc( x, y, size ,from ,to ,reverse)
  if fill then @fill() else @stroke()
#===== UtilClass =====
Util = {}
Util.prototype =
  extend : (obj, mixin) ->
    obj[name] = method for name, method of mixin
    obj

  include : (klass, mixin) ->
    Util::extend klass.prototype, mixin

  dup : (obj)->
    f = ()->
    f.prototype = obj
    new f
include = Util::include

class Sprite
  constructor: (@x=0,@y=0,@scale=10) ->
  render: (g)->
    g.beginPath()
    g.arc(@x,@y, 15 ,0,Math.PI*2,true)
    g.stroke()

  get_distance: (target)->
    xd = Math.pow (@x-target.x) ,2
    yd = Math.pow (@y-target.y) ,2
    return Math.sqrt xd+yd

  get_relative:(cam)->
    pos =
      vx : 320 + @x - cam.x
      vy : 240 + @y - cam.y

  find_obj:(group_id,targets, range)->
    targets.filter (t)=>
      t.group is group_id and @get_distance(t) < range

class ImageSprite
  constructor:(src,@size)->
    @img = new Image
    @img.src = src
  draw:(g)->
    g.drawImage(@img, x,y)

class CanvasSprite
  constructor:(@size=32)->
    buffer = document.createElement('canvas')
    buffer.width = buffer.height = @size
    @shape buffer.getContext('2d')
    @img = new Image
    @img.src = buffer.toDataURL()

  p2ism : (x,y)->
    [(x+y)/2
     (x-y)/4
    ]

  draw:(g,x,y)->
    dx = dy = ~~(@size/2)
    g.drawImage(@img, x-dx,y-dy)

class CharSprite extends CanvasSprite
  shape: (g)->
    cx = cy = 16 
    g.init Color.i(64,255,64)
    g.arc( cx , cy-7 ,3 ,0 , 2*Math.PI )
    g.fill()

    g.beginPath()
    g.moveTo cx,cy
    g.lineTo(xx,yy) for [xx,yy] in [
      [cx-4  , cy-3 ]
      [cx+4  , cy-3 ]
    ]
    g.lineTo cx,cy
    g.fill()

class PlayerSprite extends CanvasSprite
  shape: (g)->
    cx = cy = 16 
    g.init Color.i(64,64,255)
    g.arc( cx , cy-7 ,3 ,0 , 2*Math.PI )
    g.fill()

    g.beginPath()
    g.moveTo cx,cy
    g.lineTo(xx,yy) for [xx,yy] in [
      [cx-4  , cy-3 ]
      [cx+4  , cy-3 ]
    ]
    g.lineTo cx,cy
    g.fill()

class MonsterSprite extends CanvasSprite
  shape: (g,color)->
    cx = cy = 16 
    g.init color or Color.i(255,64,64)
    g.arc( cx , cy-7 ,3 ,0 , 2*Math.PI )
    g.fill()

    g.beginPath()
    g.moveTo cx,cy
    g.lineTo(xx,yy) for [xx,yy] in [
      [cx-4  , cy-3 ]
      [cx+4  , cy-3 ]
    ]
    g.lineTo cx,cy
    g.fill()

class TileSprite extends CanvasSprite
  shape: (g)->
    g.init(Color.Black)
    g.moveTo 0,16
    g.lineTo(x,y) for [x,y] in [
      [16,24] , [32,16], [16,8]
    ]
    g.lineTo 0,16
    g.fill()

  draw:(g,x,y)->
    g.drawImage(@img, x,y)

class GroundSprite extends CanvasSprite
  constructor:(@map , @size=32)->
    @ip = [800,1600]
    [mx,my] = [@map.length*@size , @map[0].length*@size]
    gr = document.createElement('canvas')
    gr.width = 32*100
    gr.height = 32*100

    up = document.createElement('canvas')
    up.width = 32*100
    up.height = 32*100

    @shape gr.getContext('2d'),up.getContext('2d')
    @ground = new Image
    @ground.src = gr.toDataURL()

    @upper = new Image
    @upper.src = up.toDataURL()

  p2ism : (x,y)->
    [ix,iy]= @ip
    [(x+y)/2+ix
     (x-y)/4+iy
    ]

  shape: (g,u)->
    h = 32
    for i in [0 ... @map.length]
      for _j in [0 ... @map[i].length]
        j = @map[i].length - _j - 1 
        [vx,vy] = @p2ism i*@size ,j*@size
        unless @map[i][j] # 通路
          g.init Color.i(192,192,192)
          g.moveTo vx,vy
          g.lineTo(x,y) for [x,y] in [
            [vx+16,vy+8],[vx+32,vy],[vx+16,vy-8]
          ]
          g.lineTo vx,vy
          g.fill()
        else # 壁
          u.init Color.i(64,64,64)
          # 動的なハイト生成パターン
          # h = ~~(3+Math.random()*2)*16
          # h = ~~(j/@map[0].length*20)*8
          # 上の壁
          uy = vy - h
          u.moveTo vx,uy
          u.lineTo(x,y) for [x,y] in [
            [vx+16,uy+8],[vx+32,uy],[vx+16,uy-8]
          ]
          u.lineTo vx,uy
          u.fill()

          # 左柱
          g.init Color.i(62,62,62)
          g.moveTo vx,vy
          g.lineTo(x,y) for [x,y] in [
            [vx,vy-h],[vx+16,vy-h],[vx+16,vy+8]
          ]
          g.lineTo vx,vy
          g.fill()

          # 右柱
          g.init Color.i(48,48,48)
          g.moveTo vx+16,vy+8
          g.lineTo(x,y) for [x,y] in [
            [vx+16,vy+8-h],[vx+32,vy-h],[vx+32,vy]
          ]
          g.lineTo vx+16,vy+8
          g.fill()


  draw:(g,cx,cy)->
    [ix,iy]= @ip
    g.drawImage(@ground, cx-320+ix, cy+iy-240, 640, 480, 0 , 0 , 640, 480)
  draw_upper:(g,cx,cy)->
    [ix,iy]= @ip
    g.drawImage(@upper, cx-320+ix, cy+iy-240, 640, 480, 0 , 0 , 640, 480)


class GameRenderer
  constructor : (id,width,height)->
    # @map = null
    @uid = null
    @cam = [0,0]
    @_camn = [0,0]
    @mouse = [0,0]
    @scale = 32
    @canvas =  document.getElementById "game"
    @g = @canvas.getContext '2d'

    @canvas.width = 640
    @canvas.height = 480

    @player_sp = new PlayerSprite 32
    @char_sp = new CharSprite 32
    @monster_sp = new MonsterSprite 32
    @tile_sp = new TileSprite 32

    window.onkeydown = (e)->
      e.preventDefault()
      key = getkey(e.keyCode)
      soc.emit "keydown",code:key

    window.onkeyup = (e)->
      e.preventDefault()
      key = getkey(e.keyCode)
      soc.emit "keyup", code:key

    @canvas.onmousedown = (e)=>
      console.log [x,y] = @ism2pos e.offsetX,e.offsetY
      soc.emit "click_map", x:x,y:y

  create_map:(map)->
    @gr_sp = new GroundSprite map ,32

  to_ism_native : (x,y)->
    [(x+y)/2
     (x-y)/4
    ]

  to_ism : (x,y)->
    [cx,cy] = @cam
    [
     320-cx+(x+y)/2
     240-cy+(x-y)/4
    ]

  ism2pos : (x,y)->
    [dx,dy] = [x-320,y-240]
    [cx,cy] = @_camn
    [
      cx+dx+2*dy
      cy+dx-2*dy
    ]

  render : (data={})->
    # 扱うオブジェクト
    objs = data.objs
    for i in objs
      [x,y,id,oid] = i.o
      if id is @uid
        @_camn = [x,y]
        @cam = @to_ism_native(x,y)
        break

    # 初期化
    @g.clearRect(0,0,640,480)

    [cx,cy] = @cam

    @gr_sp?.draw(@g,cx,cy)
    for i in objs
      [x,y,id, oid] = i.o
      {n,hp,lv} = i.s
      [vx,vy] = @to_ism( x/32*@scale,y/32*@scale)
      if -64 < vx < 706 and -48 < vy < 528
        if id is @uid 
          @player_sp.draw(@g,vx,vy)
          @g.init Color.Blue
        if id > 1000
          @char_sp.draw(@g,vx,vy)
          @g.init Color.Green
        else 
          @monster_sp.draw(@g,vx,vy)
          @g.init Color.Red
        # drawInfo
        if i.t
          [tx,ty,tid,toid] = i.t
          [tvx,tvy] = @to_ism( tx/32*@scale,ty/32*@scale)
          # ターゲット線
          @g.beginPath()
          @g.moveTo vx,vy
          @g.lineTo tvx,tvy
          @g.stroke()

          #ロックオンカーソル
          {PI} = Math
          # @g.init Color.i(0,0,0)
          @g.beginPath()
          @g.arc(tvx,tvy, ~~(@scale/2) ,-PI/6,PI/6,false)
          @g.stroke()
          @g.beginPath()
          @g.arc(tvx,tvy, ~~(@scale/2) ,5*PI/6,7*PI/6,false)
          @g.stroke()
          # @g.moveTo tvx-@size/2-3,tvy-@size/2
          # @g.lineTo tvx-@size-3,tvy
          # @g.lineTo tvx-@size/2-3,tvy+@size/2
          @g.stroke()

        @g.init Color.Black
        @g.fillText ''+~~(hp) , vx-6,vy-12
        @g.fillText n , vx-10,vy+6
    @gr_sp?.draw_upper(@g,cx,cy)

