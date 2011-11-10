{Game} = require './src/core'
game = new Game
game.start()

log_level = 3

mongolian = require 'mongolian'
server = new mongolian()
db = server.db 'testdb'
users = db.collection 'user'

require('zappa') 4444, ->
  RedisStore = require('connect-redis')(@express);

  @io.set( "log level", 1 )

  @app.use @express.bodyParser()
  @app.use @express.methodOverride()
  @app.use @express.cookieParser()
  @app.use @express.session
    secret: "wowowowo"
    store: new RedisStore
    cookie: { maxAge: 86400 * 1000 }
  @app.use @app.router
  @app.use @express.static __dirname+'/public'
  @app.set 'views', __dirname + '/views'
  @app.use @express.favicon()

  @set 'views', __dirname + '/views'

  @enable 'serve jquery'
  game.ws = =>
    objs = game.stage.objects.concat (v for k,v of game.stage.players)
    ret = objs.map (i)->
      name: i.name
      lv: i.status.lv
      exp: ~~(100*i.status.exp/i.status.next_lv)
      hp : ~~(100*i.status.hp/i.status.MAX_HP)
      x: i.x
      y: i.y
      id: String(i.id or 0)
      skill : i.selected_skill.name

    @io.sockets.emit 'update',
      objs: ret

  save = (id,name,char)->
    console.log id,name
    users.findOne {name:name},(e,item)=>
      if item
        char = game.stage.players[id] or char
        item.lv = char.status.lv
        item.exp = char.status.exp or 0
        item.sp = char.status.sp
        users.save item


  @shared "/shared.js":->
    r = window ? global
    r.d = (e)->
      if log_level > 0
        console.log e
    r.d1 = (e)->
      if log_level > 1
        console.log e
    r.d2 = (e)->
      if log_level > 2
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

  @get '/': ->
    console.log @session.name
    if @session.name
      @render index:
        id : @session.name
    else
      @render login:{}

  @view login:->
    a href:"/verify",-> "login"

  twoauth = require('./twitter_oauth')
  @get '/verify' : ->
    twoauth.verify @request,@response,(token,token_secret,results)=>
      @session.name = results.screen_name
      console.log "[login] #{results.screen_name}"
      @redirect '/'


  @client '/bootstrap.js': ->
    window.view =
      ObjectInfo : ko.observable []


  # ==== clinet wewbsocket ====
  @client '/index.js': ->
    window.soc = @connect()

    @on connection: ->
      grr.map = @data.map
      grr.uid = @data.uid
      grr.render_map()

    @on update: ->
      view.ObjectInfo @data.objs
      grr.render @data


  # ==== server wewbsocket ====

  @on connection: ->
    d "Connected: #{@id}"
    # game.stage.join(@id)
    @emit 'connection',map:game.stage._map,uid:@id
    # d "players:"+(k for k,v of game.stage.players).join()

  @on disconnect: ->
    char = game.stage.players[@id]
    save @id,char.name,char

    game.stage.leave(@id)
    d "Disconnected: #{@id}"
    d "players:"+(k for k,v of game.stage.players).join()

  @on keydown: ->
    game.stage.players[@id]?.keys[@data.code] = 1

  @on keyup: ->
    game.stage.players[@id]?.keys[@data.code] = 0

  @on setname: ->
    name = @data.name
    users.findOne {name:name},(e,item)=>
      if item
        d "[load] #{@data.name}"
        game.stage.join(@id,name,item)
      else
        d "[create] #{@data.name}"
        item =
          name: name
          lv: 1
          exp: 0
          sp : 0
        users.insert item
        game.stage.join(@id,name,item)

  @on save: ->
    save @id,@data.name

  setInterval ->
    d "inteval save"
    for k,v of game.stage.players
      save v.id,v.name
  ,1000*60*15
