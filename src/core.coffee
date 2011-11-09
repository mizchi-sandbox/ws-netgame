Maps = require('./maps')

class Game
  constructor: (conf) ->
    console.log("Welcome to the world!")
    @stage = new Maps.RandomStage(@,32)
    @objs = []
    @frame_count = 0

  enter: ->
    obj.update(@objs, @stage) for obj in @objs
    @stage.update @objs
    @frame_count++

  start: () ->
    @pid = setInterval =>
      @enter()
      @ws()
    , 1000/15

  stop :->
    clearInterval @pid

  ws :->




exports.Game = Game
