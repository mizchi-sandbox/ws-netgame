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

  dungeon_depth = 50
  floors = (@io.of('/f'+i) for i in [0...dungeon_depth])
  game = new Game {},dungeon_depth,@io,Users
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
    r.d = -> console.log arguments

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
        console.log e or 'save success'
        @session.name = name
        console.log 'create new character'
        @redirect '/'

  @post '/login': ->
    console.log @body
    name = @body.name
    pass = @body.pass

    Users.get name,(e,doc)=>
      console.log e or doc
      console.log 'login get ', e 
      if pass is doc.pass
        @session.name = doc.name
        @redirect '/'
      else 
        @send 'no such a user'

  # twitter login
  twoauth = require('./twitter_oauth')
  @get '/verify' : ->
    twoauth.verify @request,@response,(token,token_secret,results)=>
      @session.name = results.screen_name
      console.log "[login] #{results.screen_name}"
      @redirect '/'


  save = (char,fn=->)->
    return fn(true,null) unless char?.name
    Users.get char.name, (e,item)->
      console.log "save : ", char.name
      Users.save char.name , char.toData() ,(e)->
        if e
          console.log e

  @client '/bootstrap.js': ->
    window.view =
      ObjectInfo : ko.observable []
      CharInfo : ko.observable null
      CoolTime : ko.observable []
      edit_skill_mode : ko.observable false
      selected_panel : ko.observable null

      use_battle_point: (e)->
        at = $(e.target).attr('target')
        socket.emit 'use_battle_point', at:at

      use_skill_point: (e)->
        at = $(e.target).attr('target')
        socket.emit 'use_skill_point', at:at

      wait_for_skill : (e)->
        at = $(e.target).attr('target')
        console.log at
        @selected_panel at
        @edit_skill_mode true

      set_skill : (e)->
        at = @selected_panel()
        sname = $(e.target).attr('target')
        console.log at,sname
        socket.emit 'set_skill',
          at: at
          sname : sname
        @CharInfo().skills.preset[at] = sname

        @selected_panel null
        @edit_skill_mode false

  # emitter for client
  game.ws = =>
    # for n , stage of game.stages
    c = 0
    for stage in game.stages
      c++
      pnames = (v.name for k,v of stage.players)
      if pnames.length
        console.log stage.depth,pnames
        stage.emit()
        for k,p of stage.players
          console.log k
          seq = ['one','two','three','four','five','six','seven','eight','nine','zero']
          buff = []
          for i in seq 
            if s = p.skills.sets[i]
              buff.push ~~(100*s.ct/s.CT)
          stage.sockets[k].emit 'update_ct',cooltime:buff
          console.log k,buff

        #   if game.cnt%(15*120) is 0
        #     @io.sockets.socket(id).emit 'update_char',player.toData()

  # ==== clinet wewbsocket ====
  @client '/index.js': ->
    # fid = 0
    window.login = (name , fid)=>
      console.log fid
      window.socket?.disconnect()
      delete window.socket
      window.socket = @connect("http://localhost:4444/f"+fid)
      socket.emit 'login', name:name
      
      socket.on 'connection',(data)->
        grr.create_map data.map
        grr.events = data.events
        grr.uid = data.uid

      socket.on 'next_floor',(data)->
        socket.disconnect()
        window.floor++
        window.login name , window.floor

      socket.on 'prev_floor',(data)->
        socket.disconnect()
        window.floor--
        window.login name , window.floor

      socket.on 'update',(data)->
        view.ObjectInfo data.objs
        grr.render data

      socket.on 'update_ct',(data)->
        # console.log data
        # # view.ObjectInfo data.objs
        view.CoolTime data.cooltime

      socket.on 'update_char' ,(data)->
        view.CharInfo data

    # window.logout = ()=>
    #   socket.disconnet()

