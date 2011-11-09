# window.requestAnimationFrame = (->
#   window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or window.oRequestAnimationFrame or window.msRequestAnimationFrame or (callback, element) ->
#     window.setTimeout callback, 1000 / 60
# )()

# window.onload = ->
#   game = new Game
#     WINDOW_WIDTH: 640
#     WINDOW_HEIGHT: 480
#     CANVAS_NAME: "game"
#     FPS : 60
#   game.start()

exports.Game = Game
