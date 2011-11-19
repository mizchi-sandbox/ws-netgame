{Game} = require './src/core'
config = require './config'
nstore = require('nstore')
Users = nstore.new("savedata.db")
{create_new} = require './src/Player'
util = require './src/Util'

require('zappa') config.port, ->

  @io.configure =>
    @io.set( "log level", 1 )
    # @io.set "authorization", (handshakeData, callback) ->
    #   cookie = handshakeData.headers.cookie;
    #   handshakeData.foo = cookie
    #   console.log cookie
    #   callback(null, true)

  dungeon_depth = 3
  floors  = []
  floors[i] = @io.of('/f'+i) for i in [0...dungeon_depth]
  game = new Game {},dungeon_depth
  game.start()

  @app.use @express.bodyParser()
  @app.use @express.methodOverride()
  @app.use @express.cookieParser()
  @app.use @express.session
    secret: config.session_secret
    cookie: { maxAge: 86400 * 1000 }
  @app.use @app.router
  @app.use @express.static __dirname+'/public'
  @app.set 'views', __dirname + '/views'
  @app.use @express.favicon()

  @set 'views', __dirname + '/views'
  @enable 'serve jquery'

  @shared "/shared.js":->
    r = window ? global
    r.d = (e)->
      console.log e

    r.getkey = (keyCode) ->
      switch keyCode
        when 68,39 then return 'right'
        when 65,37 then return 'left'
        when 87,38 then return 'up'
        when 83,40 then return 'down'
        when 32 then return 'space'
        when 17 then return 'ctrl'
        when 48 then return 'zero'
        when 49 then return 'one'
        when 50 then return 'two'
        when 51 then return 'three'
        when 52 then return 'four'
        when 53 then return 'five'
        when 54 then return 'sixe'
        when 55 then return 'seven'
        when 56 then return 'eight'
        when 57 then return 'nine'
      return String.fromCharCode(keyCode).toLowerCase()

  # Rooting
  @get '/logout': ->
    @session.destroy ()=>
      @redirect '/'

  @get '/api/id': ->
    @send @session.name or ''

  @get '/': ->
    console.log @session.name
    # @session.name = "test"  # for debug
    if @session.name
      @render index:
        id : @session.name
    else
      @render login:{layout:false}

  @post '/register': ->
    console.log 'create account', @body
    name = @body.name
    pass = @body.pass
    race = @body.race
    cls = @body.class

    Users.get name,(e,doc)=>
      if doc
        @send 'already exist.'
        return

      savedata = create_new(name,race,cls)
      savedata.pass = pass

      Users.save @body.name , savedata, (e)=>
        @session.name = name
        console.log 'create new character'
        @redirect '/'

  @post '/login': ->
    console.log @body
    name = @body.name
    pass = @body.pass

    Users.get name,(e,doc)=>
      console.log e if e
      if pass is doc.pass
        @session.name = doc.name
        @redirect '/'
      else 
        @send 'no such a user'

  twoauth = require('./twitter_oauth')
  @get '/verify' : ->
    twoauth.verify @request,@response,(token,token_secret,results)=>
      @session.name = results.screen_name
      console.log "[login] #{results.screen_name}"
      @redirect '/'

  @client '/bootstrap.js': ->
    window.view =
      ObjectInfo : ko.observable []
      CharInfo : ko.observable null
      CoolTime : ko.observable []

      use_battle_point: (e)->
        at = $(e.target).attr('target')
        socket.emit 'use_battle_point', at:at

      use_skill_point: (e)->
        at = $(e.target).attr('target')
        socket.emit 'use_skill_point', at:at

  save = (char,fn=->)->
    return fn(true,null) unless char?.name
    Users.get char.name, (e,item)->
      console.log "save : ", char.name
      Users.save char.name , char.toData() ,(e)->
        if e
          console.log e
        fn()

  # emitter for client
  game.ws = =>
    fix = (n)-> ~~(100*n)/100
    for n , stage of game.stages
      len = ('' for k,v of stage.players).length
      if len > 0
        objs = stage.objects.concat (v for k,v of stage.players)
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

        # ネームスペースにブロードキャスト
       # socket.volatile.emit('volatile msg', ++i); 
        # f1.emit 'update',
        floors[n].emit 'update',
          objs: ret

        for id,player of stage.players
          seq = ['one','two','three','four','five','six','seven','eight','nine','zero']
          buff = []
          for i in seq 
            if s = player.skills.sets[i]
              buff.push ~~(100*s.ct/s.CT)
          # @io.sockets.socket(id).emit 'update_ct',cooltime:buff

          if game.cnt%(15*120) is 0
            @io.sockets.socket(id).emit 'update_char',player.toData()

  # ==== clinet wewbsocket ====
  @client '/index.js': ->
    window.socket = @connect("http://localhost:4444/f1")
    socket.on 'connection',(data)->
      console.log "on return connection!"
      grr.create_map data.map
      grr.uid = data.uid

    socket.on 'update',(data)->
      view.ObjectInfo data.objs
      grr.render data

    socket.on 'update_ct',(data)->
      view.ObjectInfo data.objs
      view.CoolTime data.cooltime

    socket.on 'update_char' ,(data)->
      view.CharInfo data

  # ==== server wewbsocket ====
  # floor = 'f1'

  fnum = 1
  # for fnum in [0...dungeon_depth]
  # if game.stages[fnum] then continue
  floor = floors[fnum]
  floor.on "connection" ,(soc)->
    id = soc.id 
    d "Connected: #{id}"

    player = null
    stage = game.stages[fnum]

    soc.emit 'connection',
      map:stage._map
      uid:id

    # login and logout
    soc.on 'login',(data)->
      name = data.name
      Users.get name, (e,savedata)=>
        player = stage.join id,name,savedata , soc
        soc.emit 'update_char',player.toData()

    soc.on "disconnect" ,(data)->
      d "Disconnected: #{id}"
      save player,=>
        stage.leave(id)

    # player action
    soc.on "keydown" ,(data)->
      player?.keys[data.code] = 1

    soc.on "keyup" ,(data)->
      player?.keys[data.code] = 0

    soc.on "click_map" ,(data)->
      player?._wait = 0
      player?.destination =
        x:data.x
        y:data.y

    soc.on "click_map" ,(data)->
      player?.status.use_battle_point( data.at)
      save player,->d 'save done'
      soc.emit 'update_char',  player?.toData()

    soc.on "use_battle_point" ,(data)->
      player?.status.use_battle_point(data.at)
      save player,->d 'save done'
      soc.emit 'update_char',  player?.toData()

    soc.on "use_skill_point", (data)->
      player?.skills.use_skill_point(data.at)
      save player,->d 'save done'
      soc.emit 'update_char' , player?.toData()


  # setInterval -> d "inteval save"for k,v of game.stages.f1.players
  #     save v,=>
  # ,1000*60*15


