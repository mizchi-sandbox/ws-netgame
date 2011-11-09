{Sprite,ObjectGroup} = require('./sprites')
Skill = require('./skills')
{Weapons} = require('./equip')
{random} = Math

Array::size = ->
  return @length

randint = (from,to)->
  if not to?
    to = from
    from = 0
  ~~(random()*(to-from+1))+from

class Character extends Sprite
  scale : null
  state : null
  following_obj: null
  targeting_obj: null
  status : {}
  _items_ : []

  constructor: (@x=0,@y=0,@group=ObjectGroup.Enemy ,status={}) ->
    super @x, @y
    @state =
      active : false
    @targeting_obj = null
    @dir = 0
    @cnt = 0
    @id = ~~(random() * 100)
    @animation = []
    @cnt = ~~(random() * 60)
    @distination = [@x,@y]
    @_path = []
    @keys = {}
    @gold = 0

  regenerate: ()->
    r = (if @targeting_obj then 2 else 1)
    if @is_alive()
      if @status.hp < @status.MAX_HP
        @status.hp += 1

  update:(objs, cmap)->
    @cnt += 1
    if @is_alive()
      @check()
      @regenerate() if @cnt%60 == 0
      @search objs
      @move(objs,cmap)
      @change_skill()
      @selected_skill.update(objs)

  search : (objs)->
    enemies = @find_obj(ObjectGroup.get_against(@),objs,@status.sight_range)
    if @has_target()
      if @targeting_obj.is_dead() or @get_distance(@targeting_obj) > @status.sight_range*1.5
        console.log "#{@name} lost track of #{@targeting_obj.name}"
        @targeting_obj = null
    else if enemies.length > 0
      @targeting_obj = enemies[0]
      console.log "#{@name} find #{@targeting_obj.name}"

  move: (objs ,cmap)->
    # for wait
    if @has_target()
      @set_dir(@targeting_obj.x,@targeting_obj.y)
      return if @get_distance(@targeting_obj) < @selected_skill.range
    else
      return if @cnt%60 < 15

    if @has_target() and @cnt%60 is 0
      @_update_path(cmap)

    if @to
    # 目的地が設定されてる場合
      dp = cmap.get_point(@to[0],@to[1])
      [nx,ny] = @_trace( dp.x , dp.y )
      wide = @status.speed
      if dp.x-wide<nx<dp.x+wide and dp.y-wide<ny<dp.y+wide
        if @_path.length > 0
          @to = @_path.shift()
        else
          @to = null
    else
      if @has_target()
        @_update_path(cmap)
      else
        c = cmap.get_cell(@x,@y)
        @to = [c.x+randint(-1,1),c.y+randint(-1,1)]

    if not cmap.collide( nx,ny )
      @x = nx if nx?
      @y = ny if ny?

    if @x is @_lx_ and @y is @_ly_
      c = cmap.get_cell(@x,@y)
      @to = [c.x+randint(-1,1),c.y+randint(-1,1)]
    @_lx_ = @x
    @_ly_ = @y

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
    #
  die : (actor)->
    @cnt = 0
    if @group == ObjectGroup.Enemy
      gold = randint(0,100)
      actor.gold += gold
    actor.status.get_exp(@status.lv*10)
    console.log "#{@name} is killed by #{actor.name}." if actor
    console.log "You got #{gold}G." if gold

  add_damage : (actor, amount)->
    before = @is_alive()
    @status.hp -= amount
    @die(actor) if @is_dead() and before
    return @is_alive()

  set_skill :()->
    for k,v of @keys
      # if v and k in ["zero","one","two","three","four","five","six","seven","eight","nine"]
      if v and k in ["one","two","three","four"]
        @selected_skill = @skills[k]
        break

  _update_path : (cmap)->
    @_path = @_get_path(cmap)
    @to = @_path.shift()

  _get_path:(map)->
    from = map.get_cell( @x ,@y)
    to = map.get_cell( @targeting_obj.x ,@targeting_obj.y)
    return map.search_path( [from.x,from.y] ,[to.x,to.y] )

  _trace: (to_x , to_y)->
    @set_dir(to_x,to_y)
    return [
      @x + ~~(@status.speed * Math.cos(@dir)),
      @y + ~~(@status.speed * Math.sin(@dir))
    ]


  has_target:()->
    if @targeting_obj isnt null then true else false

  is_following:()->
    if @following_obj isnt null then true else false

  is_alive:()->
    return @status.hp > 1

  is_dead:()->
    not @is_alive()

  find_obj:(group_id,targets, range)->
    targets.filter (t)=>
      t.group is group_id and @get_distance(t) < range and t.is_alive()

  set_dir: (x,y)->
    rx = x - @x
    ry = y - @y
    if rx >= 0
      @dir = Math.atan( ry / rx  )
    else
      @dir = Math.PI - Math.atan( ry / - rx  )

  check:()->
    @status.hp = @status.MAX_HP if @status.hp > @status.MAX_HP
    @status.hp = 0 if @status.hp < 0
    if @is_alive()
      if @targeting_obj?.is_dead()
         @targeting_obj = null
    else
      @targeting_obj = null

  shift_target:(targets)->
    if @has_target() and targets.length > 0
      if not @targeting_obj in targets
        @targeting_obj = targets[0]
        return
      else if targets.size() == 1
        @targeting_obj = targets[0]
        return
      if targets.size() > 1
        cur = targets.indexOf @targeting_obj
        if cur+1 >= targets.size()
          cur = 0
        else
          cur += 1
        @targeting_obj = targets[cur]

  add_animation:(animation)->
    @animation.push(animation)

class Goblin extends Character
  name : "Goblin"
  scale : 1
  constructor: (@x,@y,@group) ->
    @dir = 0
    @status = new Status
      str: 8
      int: 4
      dex: 6
    super(@x,@y,@group,@status)
    @skills =
      one: new Skill.Skill_Atack(@,3)
      two: new Skill.Skill_Heal(@)
    @selected_skill = @skills['one']
    @_equips_ =
      main_hand : new Weapons::Dagger
      sub_hand : null
      body : null

  change_skill: ()->
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
    if actor.has_target()
      actor.targeting_obj.add_animation new Anim.prototype[@effect] amount, @size

class Player extends Character
  scale : 8
  name : "Player"
  constructor: (@scene, @x,@y,@group=ObjectGroup.Player) ->
    super(@x,@y,@group)
    @keys = {}
    @id = 0
    @status = new Status
      str: 10
      int: 10
      dex: 10
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

  change_skill: ()->
    @set_skill @keys

  update:(objs, cmap)->
    enemies = @find_obj(ObjectGroup.get_against(@),objs,@status.sight_range)
    if @keys.space == 2
      @shift_target(enemies)
    super objs,cmap


  move: (objs,cmap)->
    keys = @keys

    if keys.right + keys.left + keys.up + keys.down > 1
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

ObjectGroup =
  Player : 0
  Enemy  : 1
  Item   : 2
  is_battler : (group_id)->
    group_id in [@Player, @Enemy]
  get_against : (obj)->
    switch obj.group
      when @Player
        return @Enemy
      when @Enemy
        return @Player

class Status
  constructor: (params = {}, equips = {}, @lv = 1) ->
    @build_status(params,equips)

    @hp = @MAX_HP
    @sp = @MAX_SP
    @exp = 0
    @next_lv = @lv * 50

    @STR = params.str
    @INT = params.int
    @DEX = params.dex

  build_status:(params={},equips)->
    @MAX_HP = params.str*10
    @MAX_SP = params.int*10

    @atk = params.str
    @mgc = params.int
    @def = params.str / 10
    @res = params.int

    @regenerate = ~~(params.str/10)
    @sight_range = params.dex*20
    @speed = ~~(params.dex * 0.5)
  level_up: ()->
    @lv++
    [@STR++, @INT++ , @DEX++]
    @exp = 0
    @next_lv = @lv * 50
    @build_status str:@STR,int:@INT,dex:@DEX

  get_exp:(point)->
    @exp += point
    if @exp >= @next_lv
      @level_up()
      console.log 'you level up! to lv.'+@lv

  set_next_exp:()->
    @next_lv = @lv * 30

  onDamaged : (amount)->
  onHealed : (amount)->


exports.ObjectGroup = ObjectGroup
exports.Goblin = Goblin
exports.Player = Player
exports.Character = Character
