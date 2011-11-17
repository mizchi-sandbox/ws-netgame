{Player, Goblin} = require('./../char')
{ObjectId} = require('./../ObjectId')
{MoneyObject} = require('./../sprites')
require './../Util'
{pow,sqrt,abs,random,max,min} = Math
{Stage} = require "./../stage"

class RandomStage extends Stage
  constructor: (@context) ->
    super()
    @_map = @create_map 60,60,15
    @max_object_count = 10
    @cnt = 0
    @players = {}
    @objects = []

  get_objs:->
    (v for _,v of @players).concat(@objects)

  join : (id,name,data={},emitter)->
    @context.start() unless @context.active
    p = @players[id] = new Player(@,data)
    p.__emitter = emitter

    # レベルアップ/ステータス変更時にアップデートするコールバック関数
    p.status.on_status_change = ->
      emitter 'update_char', p.toData()

    [rx,ry]  = @get_random_point()
    p.set_pos rx,ry

    p.id = id
    p.name = name if name?

  leave : (id)->
    delete @players[id]

  update:()->
    objs = @objects.concat (v for k,v of @players)
    for i in objs
      i.update(objs,@)
    @sweep()
    if @objects.length < @max_object_count and @cnt % 10 is 0
     @pop_monster()
    @cnt++

  sweep: ()->
    for i in [0 ... @objects.length]
      if @objects[i].is_dead() and @objects[i].cnt > 5
        @objects.splice(i,1)
        break

    for _,p of @players
      if p.is_dead() and p.cnt > 60
        console.log 'dead:',p.id,p.name
        console.log  p.toData()
        @join p.id,p.name, p.toData(),p.__emitter


  pop_monster: () ->
    if random() < 0.9
      [rx,ry]  = @get_random_point()
      @objects.push( gob = new Goblin(@,ObjectId.Enemy) )

      gob.set_pos rx,ry

exports.RandomStage = RandomStage
