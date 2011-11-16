# manual backup
Skill = require('./skills')
{Weapons} = require('./equip')
{random,sqrt,min,max,sin,cos} = Math
{Sprite} = require('./sprites')
{ObjectId} = require('./ObjectId')
{randint} = require('./Util')
{Atack} = require('./skills')
Skills = require './skills'

seq = ['one','two','three','four','five','six','seven','eight','nine','zero']
class SkillBox
  constructor:(actor , data={})->
    @data = data
    for i in data
      if i.data 
        @[i.key] = new Skills[i.data.name](actor, i.data.lv)

  toData:->
    ((key:i,data:@[i]?.toData()) for i in seq)


class Character extends Sprite
  scale : null

  constructor: (@scene , @x=0,@y=0,@group=ObjectId.Enemy ,status={}) ->
    super @x, @y
    @keys = {}
    @target = null
    @dir = 0
    @id = ~~(random() * 1000)
    @cnt = ~~(random() * 60)
    @items = new ItemBox
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
    for i in seq
      @skills[i].charge(false) if @skills[i]
    @selected_skill.charge(true) #update(target)
    @selected_skill.exec(target) #update(target)


  # affected
  check:(st)->
    st.hp = st.HP if st.hp > st.HP
    st.hp = 0 if st.hp < 0
    if @is_alive()
      if @target?.is_dead()
         @target = null
    else
      @target = null

  regenerate: ()->
    r = (if @target then 2 else 1)
    if @status.hp < @status.HP
      @status.hp += 1

  # recognize
  search : (objs)->
    range = (if @target then @status.trace_range else @status.active_range)
    enemies = @find_obj(ObjectId.get_enemy(@),objs,range)
    if @target
      if @target.is_dead() or @get_distance(@target) > @status.trace_range
        console.log "#{@name} lost track of #{@target.name}"
        @target = null
    else if enemies.length is 1
      @target = enemies.first()
      console.log "#{@name} find #{@target.name}"
    else if enemies.length > 1
      enemies.sort (a,b)=>
        @get_distance(a) - @get_distance(b)
      @target = enemies.first()
      console.log "#{@name} find #{@target.name}"

  select_skill: ()->
    @selected_skill = new Skill.Atack(@)

  # action
  is_waiting : ()->
    if @target
      @set_dir(@target.x,@target.y)
      return true if @get_distance(@target) < @selected_skill.range
    else if @group isnt ObjectId.Player
      return true if @cnt%60 < 15
    return false

  onDamaged : (amount)->
    console.log "#{@name} is damaged"

  onHealed : (amount)->

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


  equip_item : (item)->
    if item.at in (k for k,v of @equipment)
      @equipment[item.at] = item
    false

  get_item:(item)->
    null
    # @items.push(item)

  use_item:(item)->
    # @items.remove(item)

  get_param:(param)->
    0
    # (item?[param] or 0 for at,item of @equipment).reduce (x,y)-> x+y


  add_damage : (actor, amount)->
    before = @is_alive()
    @status.hp -= amount
    unless @target
      if @get_distance(actor) < @status.trace_range
        @target = actor
    @die(actor) if @is_dead() and before
    return @is_alive()



  is_alive:()-> @status.hp > 1
  is_dead:()-> ! @is_alive()

  set_pos : (@x=0,@y=0)->
  set_dir: (x,y)->
    rx = x - @x
    ry = y - @y
    if rx >= 0
      @dir = Math.atan( ry / rx  )
    else
      @dir = Math.PI - Math.atan( ry / - rx  )

  add_animation:(animation)->
    @animation.push(animation)

  toData :()->
    obj = 
      name  : @name
      skills: @skills.toData()
      status: @status.toData()
      equipment : @equipment.toData() 
      items : @items.toData()

class Goblin extends Character
  name : "Goblin"
  scale : 1
  constructor: (@scene , @group,lv=1) ->
    @set_pos()
    @race = 'Goblin'
    # @id = ObjectId.Monster
    @dir = 0
    @status = new Status {lv:1,str: 8, int: 4, dex:6},1
    @status.trace_range = 32*8
    super(@scene ,@x,@y,@group,@status)
    @skills = new SkillBox @,[
      {
        key : 'one'
        data :
          name : 'Atack'
          lv   : 1
      },
      {
        key : 'two'
        data :
          name : 'Heal'
          lv   : 1
      }
    ]
    # @skills.one = new Skill.Atack(@,3)
    # @skills.two = new Skill.Heal(@)
    @selected_skill = @skills.one
    @equipment = new Equipment
      main_hand : 
        name : 'dagger'
        drate : 0.7

  select_skill: ()->
    if @status.hp < 5
      last = @selected_skill
      @selected_skill = @skills['two']
    else
      @selected_skill = @skills['one']

  die : (actor)->
    super actor
    actor.get_item new Weapons::Dagger

  exec:(actor,objs)->
    super actor,objs

class Player extends Character
  # Controller Implement
  scale : 8
  constructor: (@scene, data = {},@group=ObjectId.Player) ->
    @name = data.name

    @set_pos()
    super(@scene,@x,@y,@group)
    @status = new Status data.status
    @equipment = new Equipment data.equipment

    # @skills.one = new Atack @
    @skills = new SkillBox @,data.skills
    @selected_skill = @skills.one

    @status.active_range = 72
    @status.trace_range = 72

  select_skill :()->
    for k,v of @keys
      if v and k in ["one","two","three","four","five"]
      # if v and k in ["one"]
        return @selected_skill = @skills[k]

  update:(objs)->
    cmap = @scene
    enemies = @find_obj(ObjectId.get_enemy(@),objs,@status.active_range)
    if @keys.space is 1
      @shift_target(enemies)

    range = @selected_skill.range
    @status.active_range = range
    @status.trace_range = range

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
      if ++@_wait > 120
        return
      else
        super()
        return
    else if sum > 1
      move = ~~(@status.speed * 0.7 )
    else
      move = @status.speed
    @to = null
    @_wait = 0

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


class Equipment
  constructor:(data={})->
    @main_hand = data.main_hand or null
    @sub_hand = data.sub_hand or null
    @body = data.body or null
    @arm = data.arm or null
    @leg = data.leg or null
    @ring1 = data.ring1 or null
    @ring2 = data.ring2 or null

  toData : ->
    main_hand: @main_hand
    sub_hand : @sub_hand
    body : @body
    arm : @arm
    leg : @leg
    ring1 : @ring1
    ring2 : @ring2


class Status
  constructor: (data = {}) ->
    @lv = data.lv or 0
    @exp = data.exp or 0
    @gold = data.gold or 10 

    @sp = data.sp or 0  
    @bp = data.bp or 0
    @class = data.class or null
    @race = data.race or null
    @str = data.str or 5
    @int = data.int or 5
    @dex = data.dex or 5

    @rebuild()

  rebuild:()->
    @HP = @str*10
    @MP = @int*10
    @hp = @HP
    @mp = @MP

    @atk = @str
    @mgc = @int
    @def = @str / 10
    @res = @int / 10

    @regenerate = ~~(@str/10)
    @active_range = @dex*20
    @speed = ~~(@dex * 0.5)

    @next_lv = @lv * 50

  level_up: ()->
    @lv++
    @exp = 0
    @sp++
    @bp++ if @lv%3 is 0 
    @next_lv = @lv * 50
    @rebuild()
    @on_status_change()


  on_status_change :->
    
  use_skill_point:(sname)->
    # TODO

  use_battle_point:(at)->
    if @bp>0 and at in ["str","int","dex"]
      @bp--
      @[at] +=1
      @rebuild()

      console.log 'call on changed'
      @on_status_change()
      true
    else
      null


  get_exp:(point)->
    console.log "get :"+point
    @exp += point
    if @exp >= @next_lv
      @level_up()
      console.log 'level up! to lv.'+@lv

  set_next_exp:()->
    @next_lv = @lv * 30

  toData : ->
    class: @class
    race : @race
    exp  : @exp
    lv   : @lv
    sp   : @sp 
    bp   : @bp 
    hp   : @hp
    HP   : @HP
    mp   : @mp
    MP   : @MP
    str  : @str
    int  : @int
    dex  : @dex
    gold : @gold

class ItemBox
  constructor : (data)->
    @items = data or []
  toData :->
    @items
exports.create_new = (name,race,cls)->
  classes =
    Lord: 
      str : 10
      int : 10
      dex : 10 

  races =
    human :
      str : 0
      int : 0
      dex : 0
  #mock
  p = new Player null ,{}

  st = classes[cls]
  r = races[race]
  st.str += r.str
  st.int += r.int
  st.dex += r.dex

  status  = new Status st
  status.race = race 
  status.class = cls
  status.gold = 0
  status.exp = 0
  status.lv = 1
  status.sp = 3
  status.bp = 3

  equipment = new Equipment 
    main_hand : 'dagger'
  items = new ItemBox {}

  atack = new Skill.Atack
  skills = new SkillBox p
  data = 
    name : name
    status : status.toData()
    equipment : equipment.toData()
    items : items.toData()
    skills:skills.toData()

  p = new Player null , data
  p.skills.one = new Skill.Atack p,1
  p.skills.two = new Skill.Smash p,1
  p.skills.three = new Skill.Heal p,1
  p.skills.four = new Skill.Meteor p,1
  p.skills.five = new Skill.Lightning p,1
  p.selected_skill = p.skills.one

  console.log p.toData()
  p.toData()


exports.Goblin = Goblin
exports.Player = Player
exports.Character = Character
