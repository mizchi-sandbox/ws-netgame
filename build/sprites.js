(function() {
  var Animation, Animation_Slash, Sprite;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Sprite = (function() {
    function Sprite(x, y, scale) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.scale = scale != null ? scale : 10;
    }
    Sprite.prototype.render = function(g) {
      g.beginPath();
      g.arc(this.x, this.y, 15 - ms, 0, Math.PI * 2, true);
      return g.stroke();
    };
    Sprite.prototype.get_distance = function(target) {
      var xd, yd;
      xd = Math.pow(this.x - target.x, 2);
      yd = Math.pow(this.y - target.y, 2);
      return Math.sqrt(xd + yd);
    };
    Sprite.prototype.getpos_relative = function(cam) {
      var pos;
      pos = {
        vx: 320 + this.x - cam.x,
        vy: 240 + this.y - cam.y
      };
      return pos;
    };
    Sprite.prototype.init_cv = function(g, color, alpha) {
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
    };
    Sprite.prototype.set_dir = function(x, y) {
      var rx, ry;
      rx = x - this.x;
      ry = y - this.y;
      if (rx >= 0) {
        return this.dir = Math.atan(ry / rx);
      } else {
        return this.dir = Math.PI - Math.atan(ry / -rx);
      }
    };
    return Sprite;
  })();
  Animation = (function() {
    __extends(Animation, Sprite);
    function Animation(actor, target) {
      Animation.__super__.constructor.call(this, 0, 0);
      this.timer = 0;
    }
    Animation.prototype.render = function(g, x, y) {
      return this.timer++;
    };
    return Animation;
  })();
  Animation_Slash = (function() {
    __extends(Animation_Slash, Animation);
    function Animation_Slash() {
      this.timer = 0;
    }
    Animation_Slash.prototype.render = function(g, x, y) {
      var color, tx, ty;
      if (this.timer < 5) {
        this.init_cv(g, color = "rgb(30,55,55)");
        tx = x - 10 + this.timer * 3;
        ty = y - 10 + this.timer * 3;
        g.moveTo(tx, ty);
        g.lineTo(tx - 8, ty - 8);
        g.lineTo(tx - 4, ty - 8);
        g.lineTo(tx, ty);
        g.fill();
        this.timer++;
        return this;
      } else {
        return false;
      }
    };
    return Animation_Slash;
  })();
}).call(this);
