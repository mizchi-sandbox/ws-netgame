{Player, Goblin} = require('./../char')
{ObjectId} = require('./../ObjectId')
{MoneyObject} = require('./../sprites')
require './../Util'
{pow,sqrt,abs,random,max,min} = Math
{Stage} = require "./../stage"

class RandomStage extends Stage
  constructor: (@context , @cell=32) ->
    super @cell
    @_map = @create_map 80,80,10
    @max_object_count = 34      #
    @cnt = 0
    @players = {}
    @objects = []

  get_objs:->
    (v for _,v of @players).concat(@objects)

  join : (id,name,data={})->
    @context.start() unless @context.active
    [rx,ry]  = @get_random_point()
    p = @players[id] = new Player(@,rx,ry,data)
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

  pop_monster: () ->
    [rx,ry]  = @get_random_point()
    if random() < 0.9
      @objects.push( gob = new Goblin(@,rx, ry, ObjectId.Enemy) )


exports.RandomStage = RandomStage
