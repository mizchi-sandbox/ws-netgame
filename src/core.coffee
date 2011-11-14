{RandomStage} = require('./stages/sample')

class Game
  constructor: (conf) ->
    console.log("Welcome to the world!")
    @stage = new RandomStage(@,32)
    @objs = []
    @cnt = 0

  enter: ->
    obj.update(@objs, @stage) for obj in @objs
    @stage.update @objs
    @cnt++

  start: () ->
    @pid = setInterval =>
      @enter()
      @ws()
    , 1000/15

  stop :->
    clearInterval @pid

  ws :->

exports.Game = Game
