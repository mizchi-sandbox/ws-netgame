{Game} = require './src/core'
game = new Game
game.start()

log_level = 3

require('zappa') ->
  @io.set( "log level", 1 )
  @use "static",@app.router
    , @express.cookieParser()
    , @express.session
      secret: "mykey"
      cookie: { maxAge: 86400 * 1000 }
    , @express.methodOverride()
    , @express.bodyParser()
    , @express.favicon()
  @set 'views', __dirname + '/views'
  @enable 'serve jquery'

  game.ws = =>
    @io.sockets.emit 'update',
      objs:([i.x,i.y] for i in game.stage.objects)
      players:([i.x,i.y,i.id] for k,i of game.stage.players)

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

  @get '/': ->
    @render index:
      title: 'myapp'

  @client '/bootstrap.js': ->
    window.view =
      context : ko.observable ''


  # ==== clinet wewbsocket ====
  @client '/index.js': ->
    window.soc = @connect()

    @on connection: ->
      grr.map = @data.map
      grr.uid = @data.uid
      grr.render_map()

    @on update: ->
      grr.render @data

    $ =>
      window.grr = new GameRenderer
      ko.applyBindings view

  # ==== server wewbsocket ====
  @on connection: ->
    d "Connected: #{@id}"
    game.stage.join(@id)
    @emit 'connection',map:game.stage._map,uid:@id
    d "players:"+(k for k,v of game.stage.players).join()

  @on disconnect: ->
    game.stage.leave(@id)
    d "Disconnected: #{@id}"
    d "players:"+(k for k,v of game.stage.players).join()

  @on keydown: ->
    game.stage.players[@id].keys[@data.code] = 1

  @on keyup: ->
    game.stage.players[@id].keys[@data.code] = 0
