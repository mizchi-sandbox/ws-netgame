# manual backup
Skill = require('./skills')
{Weapons} = require('./equip')
{random,sqrt,min,max,sin,cos} = Math
{Sprite} = require('./sprites')
{ObjectId} = require('./ObjectId')
{randint} = require('./Util')
{SkillBox} = require './skills'
Skills = require './skills'
seq = ['one','two','three','four','five','six','seven','eight','nine','zero']
racial_data = require('./racialdata').RacialData
class_data = require('./classdata').ClassData

class Character extends Sprite
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
      @skills.sets[i].charge(false) if @skills.sets[i]
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
    console.log "#{@name} is damaged"

  onHealed : (amount)->

  update_path : (fp ,tp )->
    [fx ,fy] = fp
    from = [~~(fx),~~(fy)]
    [tx ,ty] = tp
    to = [~~(tx),~~(ty)]

    @_path = @scene.search_path( from ,to )
    @_path = @_path.map (i)=> @scene.get_point i[0],i[1]
    @to = @_path.shift()

  wander : ()->
    [tx,ty] = @scene.get_point(@x,@y)
    @to = [tx+randint(-1,1),ty+randint(-1,1)]

  step_forward: (to_x , to_y, wide)->
    @set_dir(to_x,to_y)
    [
      @x + wide * cos(@dir)
      @y + wide * sin(@dir)
    ]

  onDamaged : (amount)->

  is_waiting : ()->
    if @target
      @set_dir(@target.x,@target.y)
      return true if @get_distance(@target) < @selected_skill.range
    else if @group isnt ObjectId.Player
      return true if @cnt%60 < 15
    return false

  move: ()->
    if @_on_going_destination
      if @target
        @set_dir(@target.x,@target.y)
        return if @get_distance(@target) < @selected_skill.range
    else
      return if @is_waiting()

    if @destination
      @update_path( [~~(@x),~~(@y)],[~~(@destination.x),~~(@destination.y)] )
      @to = @_path.shift()
      @destination = null
      @_on_going_destination = true

    unless @to
      # 優先度 destination(人為設定) > target(ターゲット) > follow(リーダー)
      if @target
        @update_path( [~~(@x),~~(@y)],[~~(@target.x),~~(@target.y)] )
      else if @follow
        @update_path( [~~(@x),~~(@y)],[~~(@follow.x),~~(@follow.y)] )
      else
        @wander()

    else
      wide = @status.speed
      [dx,dy] = @to
      [nx,ny] = @step_forward( dx , dy ,wide)
      if dx-wide<nx<dx+wide and dy-wide<ny<dy+wide
        if @_path.length > 0
          @to = @_path.shift()
        else
          @to = null
          @_on_going_detination = false

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
      password  : @password
      skills: @skills.toData()
      status: @status.toData()
      equipment : @equipment.toData() 
      items : @items.toData()

class Goblin extends Character
  name : "Goblin"
  constructor: (@scene , @group,lv=1) ->
    @set_pos()
    @race = 'Goblin'
    # @id = ObjectId.Monster
    @dir = 0

    race = racial_data['goblin']
    race.lv = 1

    @status = new Status race,1
    @status.trace_range = 13
    super(@scene ,@x,@y,@group,@status)
    @skills = new SkillBox @,{Atack:1,Heal:1},{
      one:"Atack"
      two:"Heal"
    }
    # @skills.one = new Skill.Atack(@,3)
    # @skills.two = new Skill.Heal(@)
    @selected_skill = @skills.sets.one
    @equipment = new Equipment
      main_hand : 
        name : 'dagger'
        drate : 0.7

  select_skill: ()->
    if @status.hp < 5
      last = @selected_skill
      @selected_skill = @skills.sets['two']
    else
      @selected_skill = @skills.sets['one']

  die : (actor)->
    super actor
    actor.get_item new Weapons::Dagger

  exec:(actor,objs)->
    super actor,objs

class Player extends Character
  # Controller Implement
  constructor: (@scene, data = {},@group=ObjectId.Player) ->
    @name = data.name
    @password = data.password

    @set_pos()
    super(@scene,@x,@y,@group)
    @status = new Status data.status
    @equipment = new Equipment data.equipment


    @skills = new SkillBox @, data.skills.learned, data.skills.preset

    @selected_skill = @skills.sets.one

    @status.active_range = 4
    @status.trace_range = 4

  select_skill :()->
    for k,v of @keys
      if v and k in ["one","two","three","four","five"]
        if @skills.sets[k]
          return @selected_skill = @skills.sets[k]

  update:(objs)->
    enemies = @find_obj(ObjectId.get_enemy(@),objs,@status.active_range)

    if @keys.space is 1 and @_last_space_ is 0
      @shift_target(enemies)
    @_last_space_ = @keys.space

    range = @selected_skill.range
    @status.active_range = range
    @status.trace_range = range

    super objs,@scene

  set_destination:(x,y)->
    @target = x:x,y:y,is_dead:(->false),status:{get_param:->}

  wander : ->

  move: ->
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
      move = @status.speed * 0.7
    else
      move = @status.speed
    @_on_going_destination = false
    @to = null
    @_wait = 0

    if keys.right
      if @scene.collide( @x+move , @y )
        @x = ~~(@x)+1-0.1
      else
        @x += move
    if keys.left
      if @scene.collide( @x-move , @y )
        @x = ~~(@x)+0.1
      else
        @x -= move
    if keys.down
      if @scene.collide( @x , @y-move )
        @y = ~~(@y)+0.1
      else
        @y -= move
    if keys.up
      if @scene.collide( @x , @y+move )
        @y = ~~(@y)+1-0.1
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
    @active_range = 4
    @speed = @dex/40

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

      @on_status_change()
      true
    else
      null


  get_exp:(point)->
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

exports.create_new = (name,racial_name,cls_name)->
  #mock
  cls_data = class_data[cls_name]
  r = racial_data[racial_name]

  _status = 
    str : cls_data.status.str + r.str
    int : cls_data.status.int + r.int
    dex : cls_data.status.dex + r.dex

  status  = new Status _status
  status.race = racial_name
  status.class = cls_name
  status.gold = 0
  status.exp = 0
  status.lv = 1
  status.sp = 3
  status.bp = 2

  equipment = new Equipment 
    main_hand : 'dagger'

  items = new ItemBox {}
  skills = new SkillBox p , cls_data.learned, cls_data.preset

  data = 
    name : name
    status : status.toData()
    equipment : equipment.toData()
    items : items.toData()
    skills: skills.toData()
  p = new Player null , data
  p.toData()


exports.Goblin = Goblin
exports.Player = Player
exports.Character = Character
