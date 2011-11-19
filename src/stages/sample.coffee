{Goblin} = require('./../Monster')
{Player} = require('./../Player')
{ObjectId} = require('./../ObjectId')
{MoneyObject} = require('./../sprites')
{pow,sqrt,abs,random,max,min} = Math
{Stage} = require "./../stage"

nstore = require('nstore')
Users = nstore.new("savedata.db")
save = (char,fn=->)->
  return fn(true,null) unless char?.name
  Users.get char.name, (e,item)->
    console.log "save : ", char.name
    Users.save char.name , char.toData() ,(e)->
      if e
        console.log e
        
class RandomStage extends Stage
  constructor: (@context,socket) ->
    super()
    @_map = @create_map 60,60,7
    @max_object_count = 10
    @cnt = 0
    @players = {}
    @objects = []

    # for ns
    socket.on "connection" ,(soc)=>
      id = socket.id 
      player = null

      socket.emit 'connection',
        map:stage._map
        uid:id

      # login and logout
      socket.on 'login',(data)=>
        name = data.name
        Users.get name, (e,savedata)=>
          player = @join id,name,savedata, soc
          socket.emit 'update_char',player.toData()

      socket.on "disconnect" ,(data)=>
        d "Disconnected: #{id}"
        save player,=>
          @leave(id)

      # player action
      socket.on "keydown" ,(data)->
        player?.keys[data.code] = 1

      socket.on "keyup" ,(data)->
        player?.keys[data.code] = 0

      socket.on "click_map" ,(data)->
        player?._wait = 0
        player?.destination =
          x:data.x
          y:data.y

      socket.on "click_map" ,(data)->
        player?.status.use_battle_point( data.at)
        save player,->d 'save done'
        socket.emit 'update_char',  player?.toData()

      socket.on "use_battle_point" ,(data)->
        player?.status.use_battle_point(data.at)
        save player,->d 'save done'
        socket.emit 'update_char',  player?.toData()

      socket.on "use_skill_point", (data)->
        player?.skills.use_skill_point(data.at)
        save player,->d 'save done'
        socket.emit 'update_char' , player?.toData()



  get_objs:->
    (v for _,v of @players).concat(@objects)

  join : (id,name,data={},__socket)->
    @context.start() unless @context.active
    p = @players[id] = new Player(@,data)
    p.__socket = __socket

    p.status.on_status_change = ->
      p.__socket.emit 'update_char',p.toData()

    [rx,ry]  = @get_random_point()
    p.set_pos rx,ry

    p.id = id
    p.name = name if name?
    return p

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
        @join p.id,p.name, p.toData(),p.__socket


  pop_monster: () ->
    if random() < 0.9
      [rx,ry]  = @get_random_point()
      @objects.push( gob = new Goblin(@, ~~(6*Math.random()) ,ObjectId.Enemy) )

      gob.set_pos rx,ry

exports.RandomStage = RandomStage
