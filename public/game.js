var Canvas, CanvasSprite, CharSprite, Color, GameRenderer, GroundSprite, ImageSprite, MonsterSprite, PlayerSprite, Sprite, TileSprite, Util, abs, cos, include, sin, sqrt;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Array.prototype.remove = function(obj) {
  return this.splice(this.indexOf(obj), 1);
};
Array.prototype.size = function() {
  return this.length;
};
Array.prototype.first = function() {
  return this[0];
};
Array.prototype.last = function() {
  return this[this.length - 1];
};
Array.prototype.each = Array.prototype.forEach;
cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt, abs = Math.abs;
Color = {
  Red: "rgb(255,0,0)",
  Blue: "rgb(0,0,255)",
  Green: "rgb(0,255,0)",
  White: "rgb(255,255,255)",
  Black: "rgb(0,0,0)",
  i: function(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
  }
};
Canvas = CanvasRenderingContext2D;
Canvas.prototype.init = function(color, alpha) {
  if (color == null) {
    color = Color.i(255, 255, 255);
  }
  if (alpha == null) {
    alpha = 1;
  }
  this.beginPath();
  this.strokeStyle = color;
  this.fillStyle = color;
  return this.globalAlpha = alpha;
};
Canvas.prototype.initText = function(size, font) {
  if (size == null) {
    size = 10;
  }
  if (font == null) {
    font = 'Arial';
  }
  return this.font = "" + size + "pt " + font;
};
Canvas.prototype.drawLine = function(x, y, dx, dy) {
  this.moveTo(x, y);
  this.lineTo(x + dx, y + dy);
  return this.stroke();
};
Canvas.prototype.drawPath = function(fill, path) {
  var px, py, sx, sy, _ref, _ref2;
  _ref = path.shift(), sx = _ref[0], sy = _ref[1];
  this.moveTo(sx, sy);
  while (path.size() > 0) {
    _ref2 = path.shift(), px = _ref2[0], py = _ref2[1];
    this.lineTo(px, py);
  }
  this.lineTo(sx, sy);
  if (fill) {
    return this.fill();
  } else {
    return this.stroke();
  }
};
Canvas.prototype.drawDiffPath = function(fill, path) {
  var dx, dy, px, py, sx, sy, _ref, _ref2, _ref3, _ref4;
  _ref = path.shift(), sx = _ref[0], sy = _ref[1];
  this.moveTo(sx, sy);
  _ref2 = [sx, sy], px = _ref2[0], py = _ref2[1];
  while (path.size() > 0) {
    _ref3 = path.shift(), dx = _ref3[0], dy = _ref3[1];
    _ref4 = [px + dx, py + dy], px = _ref4[0], py = _ref4[1];
    this.lineTo(px, py);
  }
  this.lineTo(sx, sy);
  if (fill) {
    return this.fill();
  } else {
    return this.stroke();
  }
};
Canvas.prototype.drawLine = function(x, y, dx, dy) {
  this.moveTo(x, y);
  this.lineTo(x + dx, y + dy);
  return this.stroke();
};
Canvas.prototype.drawDLine = function(x1, y1, x2, y2) {
  this.moveTo(x1, y1);
  this.lineTo(x2, y2);
  return this.stroke();
};
Canvas.prototype.drawArc = function(fill, x, y, size, from, to, reverse) {
  if (from == null) {
    from = 0;
  }
  if (to == null) {
    to = Math.PI * 2;
  }
  if (reverse == null) {
    reverse = false;
  }
  this.arc(x, y, size, from, to, reverse);
  if (fill) {
    return this.fill();
  } else {
    return this.stroke();
  }
};
Util = {};
Util.prototype = {
  extend: function(obj, mixin) {
    var method, name;
    for (name in mixin) {
      method = mixin[name];
      obj[name] = method;
    }
    return obj;
  },
  include: function(klass, mixin) {
    return Util.prototype.extend(klass.prototype, mixin);
  },
  dup: function(obj) {
    var f;
    f = function() {};
    f.prototype = obj;
    return new f;
  }
};
include = Util.prototype.include;
Sprite = (function() {
  function Sprite(x, y, scale) {
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
    this.scale = scale != null ? scale : 10;
  }
  Sprite.prototype.render = function(g) {
    g.beginPath();
    g.arc(this.x, this.y, 15, 0, Math.PI * 2, true);
    return g.stroke();
  };
  Sprite.prototype.get_distance = function(target) {
    var xd, yd;
    xd = Math.pow(this.x - target.x, 2);
    yd = Math.pow(this.y - target.y, 2);
    return Math.sqrt(xd + yd);
  };
  Sprite.prototype.get_relative = function(cam) {
    var pos;
    return pos = {
      vx: 320 + this.x - cam.x,
      vy: 240 + this.y - cam.y
    };
  };
  Sprite.prototype.find_obj = function(group_id, targets, range) {
    return targets.filter(__bind(function(t) {
      return t.group === group_id && this.get_distance(t) < range;
    }, this));
  };
  return Sprite;
})();
ImageSprite = (function() {
  function ImageSprite(src, size) {
    this.size = size;
    this.img = new Image;
    this.img.src = src;
  }
  ImageSprite.prototype.draw = function(g) {
    return g.drawImage(this.img, x, y);
  };
  return ImageSprite;
})();
CanvasSprite = (function() {
  function CanvasSprite(size) {
    var buffer;
    this.size = size != null ? size : 32;
    buffer = document.createElement('canvas');
    buffer.width = buffer.height = this.size;
    this.shape(buffer.getContext('2d'));
    this.img = new Image;
    this.img.src = buffer.toDataURL();
  }
  CanvasSprite.prototype.p2ism = function(x, y) {
    return [(x + y) / 2, (x - y) / 4];
  };
  CanvasSprite.prototype.draw = function(g, x, y) {
    var dx, dy;
    dx = dy = ~~(this.size / 2);
    return g.drawImage(this.img, x - dx, y - dy);
  };
  return CanvasSprite;
})();
CharSprite = (function() {
  __extends(CharSprite, CanvasSprite);
  function CharSprite() {
    CharSprite.__super__.constructor.apply(this, arguments);
  }
  CharSprite.prototype.shape = function(g) {
    var cx, cy, xx, yy, _i, _len, _ref, _ref2;
    cx = cy = 16;
    g.init(Color.i(64, 255, 64));
    g.arc(cx, cy - 7, 3, 0, 2 * Math.PI);
    g.fill();
    g.beginPath();
    g.moveTo(cx, cy);
    _ref = [[cx - 4, cy - 3], [cx + 4, cy - 3]];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], xx = _ref2[0], yy = _ref2[1];
      g.lineTo(xx, yy);
    }
    g.lineTo(cx, cy);
    return g.fill();
  };
  return CharSprite;
})();
PlayerSprite = (function() {
  __extends(PlayerSprite, CanvasSprite);
  function PlayerSprite() {
    PlayerSprite.__super__.constructor.apply(this, arguments);
  }
  PlayerSprite.prototype.shape = function(g) {
    var cx, cy, xx, yy, _i, _len, _ref, _ref2;
    cx = cy = 16;
    g.init(Color.i(64, 64, 255));
    g.arc(cx, cy - 7, 3, 0, 2 * Math.PI);
    g.fill();
    g.beginPath();
    g.moveTo(cx, cy);
    _ref = [[cx - 4, cy - 3], [cx + 4, cy - 3]];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], xx = _ref2[0], yy = _ref2[1];
      g.lineTo(xx, yy);
    }
    g.lineTo(cx, cy);
    return g.fill();
  };
  return PlayerSprite;
})();
MonsterSprite = (function() {
  __extends(MonsterSprite, CanvasSprite);
  function MonsterSprite() {
    MonsterSprite.__super__.constructor.apply(this, arguments);
  }
  MonsterSprite.prototype.shape = function(g, color) {
    var cx, cy, xx, yy, _i, _len, _ref, _ref2;
    cx = cy = 16;
    g.init(color || Color.i(255, 64, 64));
    g.arc(cx, cy - 7, 3, 0, 2 * Math.PI);
    g.fill();
    g.beginPath();
    g.moveTo(cx, cy);
    _ref = [[cx - 4, cy - 3], [cx + 4, cy - 3]];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], xx = _ref2[0], yy = _ref2[1];
      g.lineTo(xx, yy);
    }
    g.lineTo(cx, cy);
    return g.fill();
  };
  return MonsterSprite;
})();
TileSprite = (function() {
  __extends(TileSprite, CanvasSprite);
  function TileSprite() {
    TileSprite.__super__.constructor.apply(this, arguments);
  }
  TileSprite.prototype.shape = function(g) {
    var x, y, _i, _len, _ref, _ref2;
    g.init(Color.Black);
    g.moveTo(0, 16);
    _ref = [[16, 24], [32, 16], [16, 8]];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], x = _ref2[0], y = _ref2[1];
      g.lineTo(x, y);
    }
    g.lineTo(0, 16);
    return g.fill();
  };
  TileSprite.prototype.draw = function(g, x, y) {
    return g.drawImage(this.img, x, y);
  };
  return TileSprite;
})();
GroundSprite = (function() {
  __extends(GroundSprite, CanvasSprite);
  function GroundSprite(map, size) {
    var gr, mx, my, up, _ref;
    this.map = map;
    this.size = size != null ? size : 32;
    this.ip = [800, 1600];
    _ref = [this.map.length * this.size, this.map[0].length * this.size], mx = _ref[0], my = _ref[1];
    gr = document.createElement('canvas');
    gr.width = 32 * 100;
    gr.height = 32 * 100;
    up = document.createElement('canvas');
    up.width = 32 * 100;
    up.height = 32 * 100;
    this.shape(gr.getContext('2d'), up.getContext('2d'));
    this.ground = new Image;
    this.ground.src = gr.toDataURL();
    this.upper = new Image;
    this.upper.src = up.toDataURL();
  }
  GroundSprite.prototype.p2ism = function(x, y) {
    var ix, iy, _ref;
    _ref = this.ip, ix = _ref[0], iy = _ref[1];
    return [(x + y) / 2 + ix, (x - y) / 4 + iy];
  };
  GroundSprite.prototype.shape = function(g, u) {
    var h, i, j, vx, vy, x, y, _j, _ref, _results;
    h = 32;
    _results = [];
    for (i = 0, _ref = this.map.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      _results.push((function() {
        var _ref2, _ref3, _results2;
        _results2 = [];
        for (_j = 0, _ref2 = this.map[i].length; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; 0 <= _ref2 ? _j++ : _j--) {
          j = this.map[i].length - _j - 1;
          _ref3 = this.p2ism(i * this.size, j * this.size), vx = _ref3[0], vy = _ref3[1];
          _results2.push((function() {
            var _i, _len, _ref4, _ref5;
            if (!this.map[i][j]) {
              g.init(Color.i(192, 192, 192));
              g.moveTo(vx, vy);
              _ref4 = [[vx + 16, vy + 8], [vx + 32, vy], [vx + 16, vy - 8]];
              for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
                _ref5 = _ref4[_i], x = _ref5[0], y = _ref5[1];
                g.lineTo(x, y);
              }
              g.lineTo(vx, vy);
              return g.fill();
            } else {
              return u.init(Color.i(64, 64, 64));
            }
          }).call(this));
        }
        return _results2;
      }).call(this));
    }
    return _results;
  };
  GroundSprite.prototype.draw = function(g, cx, cy) {
    var ix, iy, _ref;
    _ref = this.ip, ix = _ref[0], iy = _ref[1];
    return g.drawImage(this.ground, cx - 320 + ix, cy + iy - 240, 640, 480, 0, 0, 640, 480);
  };
  GroundSprite.prototype.draw_upper = function(g, cx, cy) {
    var ix, iy, _ref;
    _ref = this.ip, ix = _ref[0], iy = _ref[1];
    return g.drawImage(this.upper, cx - 320 + ix, cy + iy - 240, 640, 480, 0, 0, 640, 480);
  };
  return GroundSprite;
})();
GameRenderer = (function() {
  function GameRenderer(id, width, height) {
    this.uid = null;
    this.cam = [0, 0];
    this._camn = [0, 0];
    this.mouse = [0, 0];
    this.scale = 32;
    this.canvas = document.getElementById("game");
    this.g = this.canvas.getContext('2d');
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.player_sp = new PlayerSprite(32);
    this.char_sp = new CharSprite(32);
    this.monster_sp = new MonsterSprite(32);
    this.tile_sp = new TileSprite(32);
    window.onkeydown = function(e) {
      var key;
      e.preventDefault();
      key = getkey(e.keyCode);
      return soc.emit("keydown", {
        code: key
      });
    };
    window.onkeyup = function(e) {
      var key;
      e.preventDefault();
      key = getkey(e.keyCode);
      return soc.emit("keyup", {
        code: key
      });
    };
    this.canvas.onmousedown = __bind(function(e) {
      return soc.emit("click_map", {
        x: x,
        y: y
      });
    }, this);
  }
  GameRenderer.prototype.create_map = function(map) {
    return this.gr_sp = new GroundSprite(map, 32);
  };
  GameRenderer.prototype.to_ism_native = function(x, y) {
    return [(x + y) / 2, (x - y) / 4];
  };
  GameRenderer.prototype.to_ism = function(x, y) {
    var cx, cy, _ref;
    _ref = this.cam, cx = _ref[0], cy = _ref[1];
    return [320 - cx + (x + y) / 2, 240 - cy + (x - y) / 4];
  };
  GameRenderer.prototype.ism2pos = function(x, y) {
    var cx, cy, dx, dy, _ref, _ref2;
    _ref = [x - 320, y - 240], dx = _ref[0], dy = _ref[1];
    _ref2 = this._camn, cx = _ref2[0], cy = _ref2[1];
    return [cx + dx + 2 * dy, cy + dx - 2 * dy];
  };
  GameRenderer.prototype.render = function(data) {
    var PI, cx, cy, hp, i, id, lv, n, objs, oid, tid, toid, tvx, tvy, tx, ty, vx, vy, x, y, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    if (data == null) {
      data = {};
    }
    objs = data.objs;
    for (_i = 0, _len = objs.length; _i < _len; _i++) {
      i = objs[_i];
      _ref = i.o, x = _ref[0], y = _ref[1], id = _ref[2], oid = _ref[3];
      if (id === this.uid) {
        this._camn = [x, y];
        this.cam = this.to_ism_native(x * this.scale, y * this.scale);
        break;
      }
    }
    this.g.clearRect(0, 0, 640, 480);
    _ref2 = this.cam, cx = _ref2[0], cy = _ref2[1];
    if ((_ref3 = this.gr_sp) != null) {
      _ref3.draw(this.g, cx, cy);
    }
    for (_j = 0, _len2 = objs.length; _j < _len2; _j++) {
      i = objs[_j];
      _ref4 = i.o, x = _ref4[0], y = _ref4[1], id = _ref4[2], oid = _ref4[3];
      _ref5 = i.s, n = _ref5.n, hp = _ref5.hp, lv = _ref5.lv;
      _ref6 = this.to_ism(x * this.scale, y * this.scale), vx = _ref6[0], vy = _ref6[1];
      if ((-64 < vx && vx < 706) && (-48 < vy && vy < 528)) {
        if (id === this.uid) {
          this.player_sp.draw(this.g, vx, vy);
          this.g.init(Color.Blue);
        }
        if (id > 1000) {
          this.char_sp.draw(this.g, vx, vy);
          this.g.init(Color.Green);
        } else {
          this.monster_sp.draw(this.g, vx, vy);
          this.g.init(Color.Red);
        }
        if (i.t) {
          _ref7 = i.t, tx = _ref7[0], ty = _ref7[1], tid = _ref7[2], toid = _ref7[3];
          _ref8 = this.to_ism(tx * this.scale, ty * this.scale), tvx = _ref8[0], tvy = _ref8[1];
          this.g.beginPath();
          this.g.moveTo(vx, vy);
          this.g.lineTo(tvx, tvy);
          this.g.stroke();
          PI = Math.PI;
          this.g.beginPath();
          this.g.arc(tvx, tvy, ~~(this.scale / 2), -PI / 6, PI / 6, false);
          this.g.stroke();
          this.g.beginPath();
          this.g.arc(tvx, tvy, ~~(this.scale / 2), 5 * PI / 6, 7 * PI / 6, false);
          this.g.stroke();
          this.g.stroke();
        }
        this.g.init(Color.Black);
        this.g.fillText('' + ~~hp, vx - 6, vy - 12);
        this.g.fillText(n, vx - 10, vy + 6);
      }
    }
    return (_ref9 = this.gr_sp) != null ? _ref9.draw_upper(this.g, cx, cy) : void 0;
  };
  return GameRenderer;
})();