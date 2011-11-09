class Sprite
  constructor: (@x=0,@y=0,@scale=10) ->
  get_distance: (target)->
    xd = Math.pow (@x-target.x) ,2
    yd = Math.pow (@y-target.y) ,2
    return Math.sqrt xd+yd

  getpos_relative:(cam)->
    pos =
      vx : 320 + @x - cam.x
      vy : 240 + @y - cam.y

  find_obj:(group_id,targets, range)->
    targets.filter (t)=>
      t.group is group_id and @get_distance(t) < range

  is_targeted:(objs)->
     @ in (i.targeting_obj? for i in objs)

  has_target:()->
    false

  is_following:()->
    false

  is_alive:()->
    false
  is_dead:()->
    not @is_alive()

  find_obj:(group_id,targets, range)->
    targets.filter (t)=>
      t.group is group_id and @get_distance(t) < range and t.is_alive()

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

class ItemObject extends Sprite
  size : 10
  is_alive:()->
    @event_in
  is_dead:()->
    not @is_alive()

  constructor: (@x=0,@y=0) ->
    @cnt = 0
    @group = ObjectGroup.Item
    @event_in = true

  update:(objs,map)->
    @cnt++
      # if @event_in
      #   @event(objs,map,camera)
      #   @event_in = false
      #   @cnt=0

  event : (objs,map)->
    console.log "you got item"


class HealObject extends ItemObject
  event : (objs,map , keys ,mouse,player)->
    player.status.hp += 30
    player.check()

class MoneyObject extends ItemObject
  constructor:(x,y)->
    super(x,y)
    @amount = randint(0,100)
  event : (objs,map, player)->
    GameData.gold += @amount
    console.log "You got #{@amount}G / #{GameData.gold} "

class TresureObject extends ItemObject
  constructor:(x,y)->
    super(x,y)
    @potential = randint(0,100)
  event : (objs,map , keys ,mouse,player)->
    console.log "You got a item#{@potential}"

GameData =
  gold : 0
  items : []

exports.Sprite = Sprite
