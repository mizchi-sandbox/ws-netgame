{Goblin} = require('./../Monster')
{Player} = require('./../Player')
{ObjectId} = require('./../ObjectId')
{MoneyObject} = require('./../sprites')
{pow,sqrt,abs,random,max,min} = Math
{Stage} = require "./../stage"

save = (char,fn=->)->
  return fn(true,null) unless char?.name
  db.get char.name, (e,item)->
    console.log "save : ", char.name
    db.save char.name , char.toData() ,(e)->
      if e
        console.log e

class RandomStage extends Stage
  constructor: (@context,ns_socket,db) ->
    @ns_socket = ns_socket
    super()
    @_map = @create_map 60,60,7
    @max_object_count = 10
    @cnt = 0
    @players = {}
    @objects = []

    # for ns
    ns_socket.on "connection" ,(usoc)=>
      id = usoc.id 
      player = null

      usoc.emit 'connection',
        map: @_map
        uid: id

      # login and logout
      usoc.on 'login',(data)=>
        name = data.name
        db.get name, (e,savedata)=>
          console.log savedata ,e
          player = @join id,name,savedata, usoc
          console.log 'on login data'
          console.log player.toData()
          usoc.emit 'update_char',player.toData()

      usoc.on "disconnect" ,(data)=>
        d "Disconnected: #{id}"
        unless char?.name
          ''
        else 
          db.get char.name, (e,item)->
            console.log "save : ", char.name
            db.save char.name , char.toData() ,(e)->
              console.log e or 'save done'
        @leave(id)

      # player action
      usoc.on "keydown" ,(data)->
        player?.keys[data.code] = 1

      usoc.on "keyup" ,(data)->
        player?.keys[data.code] = 0

      usoc.on "click_map" ,(data)->
        player?._wait = 0
        player?.destination =
          x:data.x
          y:data.y

      usoc.on "click_map" ,(data)->
        player?.status.use_battle_point( data.at)
        save player,->d 'save done'
        usoc.emit 'update_char',  player?.toData()

      usoc.on "use_battle_point" ,(data)->
        player?.status.use_battle_point(data.at)
        save player,->d 'save done'
        usoc.emit 'update_char',  player?.toData()

      usoc.on "use_skill_point", (data)->
        player?.skills.use_skill_point(data.at)
        save player,->d 'save done'
        usoc.emit 'update_char' , player?.toData()

  emit : ->
    fix = (n)-> ~~(100*n)/100
    objs = @objects.concat (v for k,v of @players)
    ret = objs.map (i)->
      o:[
        fix(i.x)
        fix(i.y)
        i.id
        i.group]
      s:
        n : i.name
        hp :~~(100*i.status.hp/i.status.HP)
        lv: i.status.lv
      t:(unless i.target then null else [
          fix(i.target.x),fix(i.target.y),i.target.id, i.target.group
        ])
      a:[]

    @ns_socket.emit 'update',
      objs: ret

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
