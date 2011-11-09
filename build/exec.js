(function() {
  var conf;
  conf = {
    WINDOW_WIDTH: 640,
    WINDOW_HEIGHT: 480,
    VIEW_X: 320,
    VIEW_Y: 240,
    CANVAS_NAME: "game",
    FPS: 24
  };
  window.onload = function() {
    var game, gamewindow;
    game = new Game(conf);
    gamewindow = document.getElementById('game');
    gamewindow.onmousemove = function(e) {
      game.mouse.x = e.x - gamewindow.offsetLeft;
      return game.mouse.y = e.y - gamewindow.offsetTop;
    };
    window.document.onkeydown = function(e) {
      return game.getkey(game, e.keyCode, 1);
    };
    window.document.onkeyup = function(e) {
      return game.getkey(game, e.keyCode, 0);
    };
    return game.start(game);
  };
}).call(this);
