{RandomStage} = require('./stages/sample')

class Game
  constructor: (conf) ->
    console.log("GameEngine created...")
    @stages =
      f1: new RandomStage(@,32)
      f2: new RandomStage(@,32)
    @cnt = 0
    @active = true
    @fps = 15

  login : (name,to)->


  enter: ->
    @cnt++
    for floor , stage of @stages
      ps = (v for _,v of stage.players)
      if ps.length > 0
        stage.update()

  start: () ->
    console.log("GameEngine started...")
    @active = true
    mainloop = =>
      @enter()
      @ws()
      if @active
        setTimeout mainloop
        , 1000/@fps
    mainloop()

  stop :->
    console.log 'Game stopped'
    @active = false

  ws :->

exports.Game = Game
