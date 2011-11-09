{Game} = require './src/core'
game = new Game
game.start()

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

  mongolian = require 'mongolian'
  server = new mongolian()
  db = server.db 'game'
  user = db.collection 'user'


  game.ws = =>
    data = ([i.x,i.y] for i in game.objs)
    @io.sockets.emit 'update',objs:data


  @shared "/shared.js":->
    r = window ? global
    r.d = (e)-> console.log e

  @client '/bootstrap.js': ->
    window.view =
      context : ko.observable ''

  @client '/index.js': ->

    getkey = (keyCode) ->
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

    window.soc = @connect()
    window.onkeydown = (e)->
      key = getkey(e.keyCode)
      console.log "keydown"+key
      soc.emit "keydown",code:key

    window.onkeyup = (e)->
      key = getkey(e.keyCode)
      console.log "keyup"+key
      soc.emit "keyup", code:key

    render = (objs=[])->
      g.clearRect(0,0,640,480)
      scale = 16
      [camX,camY] = [0,300]
      to_ism = (x,y)->
        [(x+y)/2
         (x-y)/4+camY
        ]

      # monster render
      for [x,y] in objs
        g.beginPath()
        [vx,vy] = to_ism( x/32*scale,y/32*scale)
        g.arc( vx, vy ,3 ,0 , 2*Math.PI )
        g.fill()

      # map render
      for i in [0 ... map.length]
        for j in [0 ... map[i].length]
          if map[i][j]
            g.beginPath()
            [vx,vy] = to_ism i*scale ,j*scale
            g.moveTo vx,vy
            g.lineTo(x,y) for [x,y] in [
              to_ism(i*scale,(j+1)*scale)
              to_ism((i+1)*scale,(j+1)*scale)
              to_ism((i+1)*scale,j*scale)
            ]
            g.lineTo to_ism vx,vy
            g.fill()

      # rp = to_ism p.x,p.y
      # g.fillArc(  )

    @on connection: ->
      window.map = @data.map
      render()

    @on update: ->
      render @data.objs

    $ =>
      ko.applyBindings view

  @get '/': ->
    @render index:
      title: 'myapp'

  @on connection: ->
    d "Connected: #{@id}"
    game.join(@id)
    @emit 'connection',map:game.stage._map
    d "players:"+(k for k,v of game.players).join()

  @on disconnect: ->
    game.leave(@id)
    d "Disconnected: #{@id}"
    d "players:"+(k for k,v of game.players).join()

  @on keydown: ->
    game.players[@id].keys[@data.code] = 1
    console.log @id+" push "+@data.code
    console.log game.players[@id].keys

  @on keyup: ->
    game.players[@id].keys[@data.code] = 0
    console.log @id+" left "+@data.code
    console.log game.players[@id].keys
