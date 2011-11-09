(function() {
  var Game, my, rjoin, sjoin;
  Game = (function() {
    function Game(conf) {
      var canvas;
      canvas = document.getElementById(conf.CANVAS_NAME);
      this.g = canvas.getContext('2d');
      this.config = conf;
      canvas.width = conf.WINDOW_WIDTH;
      canvas.height = conf.WINDOW_HEIGHT;
      this.keys = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        space: 0,
        one: 0,
        two: 0,
        three: 0,
        four: 0,
        five: 0,
        six: 0,
        seven: 0,
        eight: 0,
        nine: 0,
        zero: 0
      };
      this.mouse = {
        x: 0,
        y: 0
      };
      this.scenes = {
        "Field": new FieldScene()
      };
      this.curr_scene = this.scenes["Field"];
    }
    Game.prototype.enter = function() {
      var next_scene;
      next_scene = this.curr_scene.enter(this.keys, this.mouse);
      this.curr_scene = this.scenes[next_scene];
      return this.draw(this.curr_scene);
    };
    Game.prototype.start = function(self) {
      return setInterval(function() {
        return self.enter();
      }, 1000 / this.config.FPS);
    };
    Game.prototype.getkey = function(self, which, to) {
      switch (which) {
        case 68:
        case 39:
          return self.keys.right = to;
        case 65:
        case 37:
          return self.keys.left = to;
        case 87:
        case 38:
          return self.keys.up = to;
        case 83:
        case 40:
          return self.keys.down = to;
        case 32:
          return self.keys.space = to;
        case 17:
          return self.keys.ctrl = to;
        case 48:
          return self.keys.zero = to;
        case 49:
          return self.keys.one = to;
        case 50:
          return self.keys.two = to;
        case 51:
          return self.keys.three = to;
        case 52:
          return self.keys.four = to;
        case 53:
          return self.keys.five = to;
        case 54:
          return self.keys.sixe = to;
        case 55:
          return self.keys.seven = to;
        case 56:
          return self.keys.eight = to;
        case 57:
          return self.keys.nine = to;
      }
    };
    Game.prototype.draw = function(scene) {
      this.g.clearRect(0, 0, this.config.WINDOW_WIDTH, this.config.WINDOW_HEIGHT);
      this.g.save();
      scene.render(this.g);
      return this.g.restore();
    };
    return Game;
  })();
  my = {
    distance: function(x1, y1, x2, y2) {
      var xd, yd;
      xd = Math.pow(x1 - x2, 2);
      yd = Math.pow(y1 - y2, 2);
      return Math.sqrt(xd + yd);
    },
    init_cv: function(g, color, alpha) {
      if (color == null) {
        color = "rgb(255,255,255)";
      }
      if (alpha == null) {
        alpha = 1;
      }
      g.beginPath();
      g.strokeStyle = color;
      g.fillStyle = color;
      return g.globalAlpha = alpha;
    },
    gen_map: function(x, y) {
      var i, j, map;
      map = [];
      for (i = 0; i <= 20; i++) {
        map[i] = [];
        for (j = 0; j <= 15; j++) {
          if (Math.random() > 0.5) {
            map[i][j] = 0;
          } else {
            map[i][j] = 1;
          }
        }
      }
      return map;
    },
    draw_line: function(g, x1, y1, x2, y2) {
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      return g.stroke();
    },
    color: function(r, g, b, name) {
      if (r == null) {
        r = 255;
      }
      if (g == null) {
        g = 255;
      }
      if (b == null) {
        b = 255;
      }
      if (name == null) {
        name = null;
      }
      switch (name) {
        case "red":
          return this.color(255, 0, 0);
        case "green":
          return this.color(0, 255, 0);
        case "blue":
          return this.color(0, 0, 255);
        case "white":
          return this.color(255, 255, 255);
        case "black":
          return this.color(0, 0, 0);
        case "grey":
          return this.color(128, 128, 128);
      }
      return "rgb(" + ~~r + "," + ~~g + "," + ~~b + ")";
    },
    draw_cell: function(g, x, y, cell, color) {
      if (color == null) {
        color = "grey";
      }
      g.moveTo(x, y);
      g.lineTo(x + cell, y);
      g.lineTo(x + cell, y + cell);
      g.lineTo(x, y + cell);
      g.lineTo(x, y);
      return g.fill();
    },
    mklist: function(list, func) {
      var buf, i, _i, _len;
      buf = [];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        i = list[_i];
        if (func(i)) {
          buf.push(i);
        }
      }
      return buf;
    }
  };
  rjoin = function(map1, map2) {
    map1;    return map1.concat(map2);
  };
  sjoin = function(map1, map2) {
    var buf, i, y, _ref;
    if (!map1[0].length === map2[0].length) {
      return false;
    }
    y = 0;
    buf = [];
    for (i = 0, _ref = map1.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      buf[i] = map1[i].concat(map2[i]);
      y++;
    }
    return buf;
  };
  String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
  };
  Array.prototype.remove = function(n) {
    return this.splice(n, 1);
  };
}).call(this);
