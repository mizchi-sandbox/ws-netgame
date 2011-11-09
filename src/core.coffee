Maps = require('./maps')

class Game
  constructor: (conf) ->
    console.log("Welcome to the world!")
    @players={}
    @stage = new Maps.RandomStage(@,32)
    @objs = []
    @frame_count = 0

  enter: ->
    obj.update(@objs, @stage) for obj in @objs
    @stage.update @objs
    @frame_count++

  join : (id)->
    @players[id] = id:id,keys:{}
    # @scene.add_player(uname)

  leave : (id)->
    delete @players[id]

  start: () ->
    @pid = setInterval =>
      @enter()
      @ws()
    , 1000/15

  ws :->

  stop :->
    clearInterval @pid



exports.Game = Game
