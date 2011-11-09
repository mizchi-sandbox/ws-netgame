(function() {
  var Anim, Animation, AreaHit, Armor, Blade, Canvas, Character, CharacterObject, ClothArmor, Color, Dagger, DamageHit, Elements, EquipItem, FieldScene, Game, GameData, Goblin, HealObject, Item, ItemBox, ItemObject, Map, MenuScene, MoneyObject, Node, ObjectGroup, OpeningScene, Player, SampleMap, Scene, SingleHit, Skill, Skill_Atack, Skill_Heal, Skill_Meteor, Skill_Smash, Skill_ThrowBomb, SmallShield, Sprite, Status, Sys, TargetAreaHit, TresureObject, UseItem, Util, Weapon, Weapons, assert, base_block, include, keys, maps, mouse, my, p, randint, rjoin, sjoin, vows, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Game = (function() {
    function Game(conf) {
      var canvas;
      Sys.prototype.message("Welcome to the world!");
      canvas = document.getElementById(conf.CANVAS_NAME);
      this.g = canvas.getContext('2d');
      this.config = conf;
      canvas.width = conf.WINDOW_WIDTH;
      canvas.height = conf.WINDOW_HEIGHT;
      this.mouse = {
        x: 0,
        y: 0
      };
      canvas.onmousemove = __bind(function(e) {
        this.mouse.x = e.x - canvas.offsetLeft;
        return this.mouse.y = e.y - canvas.offsetTop;
      }, this);
      window.document.onkeydown = __bind(function(e) {
        return this.getkey(e.keyCode, 2);
      }, this);
      window.document.onkeyup = __bind(function(e) {
        return this.getkey(e.keyCode, 0);
      }, this);
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
      this.scenes = {
        "Opening": new OpeningScene(this),
        "Field": new FieldScene(this),
        "Menu": new MenuScene(this)
      };
      this.scene_name = "Opening";
    }
    Game.prototype.enter = function() {
      var k, v, _ref, _results;
      this.scene_name = this.scenes[this.scene_name].enter(this.keys);
      this.draw(this.scenes[this.scene_name]);
      _ref = this.keys;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push(this.keys[k] === 2 ? this.keys[k]-- : void 0);
      }
      return _results;
    };
    Game.prototype.start = function() {
      var animationLoop;
      animationLoop = __bind(function() {
        this.enter();
        return requestAnimationFrame(animationLoop);
      }, this);
      return animationLoop();
    };
    Game.prototype.getkey = function(which, to) {
      switch (which) {
        case 68:
        case 39:
          this.keys.right = to;
          break;
        case 65:
        case 37:
          this.keys.left = to;
          break;
        case 87:
        case 38:
          this.keys.up = to;
          break;
        case 83:
        case 40:
          this.keys.down = to;
          break;
        case 32:
          this.keys.space = to;
          break;
        case 17:
          this.keys.ctrl = to;
          break;
        case 48:
          this.keys.zero = to;
          break;
        case 49:
          this.keys.one = to;
          break;
        case 50:
          this.keys.two = to;
          break;
        case 51:
          this.keys.three = to;
          break;
        case 52:
          this.keys.four = to;
          break;
        case 53:
          this.keys.five = to;
          break;
        case 54:
          this.keys.sixe = to;
          break;
        case 55:
          this.keys.seven = to;
          break;
        case 56:
          this.keys.eight = to;
          break;
        case 57:
          this.keys.nine = to;
      }
      return this.keys[String.fromCharCode(which).toLowerCase()] = to;
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
    mes: function(text) {
      var elm;
      elm = $("<li>").text(text);
      return $("#message").prepend(elm);
    },
    distance: function(x1, y1, x2, y2) {
      var xd, yd;
      xd = Math.pow(x1 - x2, 2);
      yd = Math.pow(y1 - y2, 2);
      return Math.sqrt(xd + yd);
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
    return map1.concat(map2);
  };
  sjoin = function(map1, map2) {
    var buf, i, y, _ref;
    if (!map1[0].length === map2[0].length) {
      return false;
    }
    y = 0;
    buf = [];
    for (i = 0, _ref = map1.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      buf[i] = map1[i].concat(map2[i]);
      y++;
    }
    return buf;
  };
  randint = function(from, to) {
    if (!(to != null)) {
      to = from;
      from = 0;
    }
    return ~~(Math.random() * (to - from + 1)) + from;
  };
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
    Sprite.prototype.is_targeted = function(objs) {
      var i;
      return __indexOf.call((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = objs.length; _i < _len; _i++) {
          i = objs[_i];
          _results.push(i.targeting_obj != null);
        }
        return _results;
      })(), this) >= 0;
    };
    Sprite.prototype.has_target = function() {
      return false;
    };
    Sprite.prototype.is_following = function() {
      return false;
    };
    Sprite.prototype.is_alive = function() {
      return false;
    };
    Sprite.prototype.is_dead = function() {
      return !this.is_alive();
    };
    Sprite.prototype.find_obj = function(group_id, targets, range) {
      return targets.filter(__bind(function(t) {
        return t.group === group_id && this.get_distance(t) < range && t.is_alive();
      }, this));
    };
    return Sprite;
  })();
  ObjectGroup = {
    Player: 0,
    Enemy: 1,
    Item: 2,
    is_battler: function(group_id) {
      return group_id === this.Player || group_id === this.Enemy;
    },
    get_against: function(obj) {
      switch (obj.group) {
        case this.Player:
          return this.Enemy;
        case this.Enemy:
          return this.Player;
      }
    }
  };
  ItemObject = (function() {
    __extends(ItemObject, Sprite);
    ItemObject.prototype.size = 10;
    ItemObject.prototype.is_alive = function() {
      return this.event_in;
    };
    ItemObject.prototype.is_dead = function() {
      return !this.is_alive();
    };
    function ItemObject(x, y) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.cnt = 0;
      this.group = ObjectGroup.Item;
      this.event_in = true;
    }
    ItemObject.prototype.update = function(objs, map, camera) {
      this.cnt++;
      if (camera.get_distance(this) < 30) {
        if (this.event_in) {
          this.event(objs, map, camera);
          this.event_in = false;
          return this.cnt = 0;
        }
      }
    };
    ItemObject.prototype.event = function(objs, map, camera) {
      return console.log("you got item");
    };
    ItemObject.prototype.render = function(g, cam) {
      var alpha, color, pos;
      pos = this.getpos_relative(cam);
      if (this.is_alive()) {
        g.init(color = "rgb(255,0,255)");
        g.drawArc(true, pos.vx, pos.vy, this.size, 0, Math.PI * 2, true);
      }
      if (this.is_dead()) {
        g.init(color = "rgb(255,0,255)", alpha = 1 - this.cnt / 120);
        return g.drawArc(true, pos.vx, pos.vy, this.size, 0, Math.PI * 2, true);
      }
    };
    return ItemObject;
  })();
  HealObject = (function() {
    __extends(HealObject, ItemObject);
    function HealObject() {
      HealObject.__super__.constructor.apply(this, arguments);
    }
    HealObject.prototype.event = function(objs, map, keys, mouse, player) {
      player.status.hp += 30;
      return player.check();
    };
    return HealObject;
  })();
  MoneyObject = (function() {
    __extends(MoneyObject, ItemObject);
    function MoneyObject(x, y) {
      MoneyObject.__super__.constructor.call(this, x, y);
      this.amount = randint(0, 100);
    }
    MoneyObject.prototype.event = function(objs, map, player) {
      GameData.gold += this.amount;
      return Sys.prototype.message("You got " + this.amount + "G / " + GameData.gold + " ");
    };
    return MoneyObject;
  })();
  TresureObject = (function() {
    __extends(TresureObject, ItemObject);
    function TresureObject(x, y) {
      TresureObject.__super__.constructor.call(this, x, y);
      this.potential = randint(0, 100);
    }
    TresureObject.prototype.event = function(objs, map, keys, mouse, player) {
      return Sys.prototype.message("You got a item" + this.potential);
    };
    return TresureObject;
  })();
  GameData = {
    gold: 0,
    items: []
  };
  Sys = new Object;
  Sys.prototype = {
    message: function(text) {
      var elm;
      if (typeof window !== "undefined" && window !== null) {
        elm = $("<li>").text(text);
        return $("#message").prepend(elm);
      } else {
        return console.log("[Message] " + text);
      }
    },
    debug: function(text) {
      return console.log(" -*- " + text);
    }
  };
  Map = (function() {
    __extends(Map, Sprite);
    function Map(cell) {
      this.cell = cell != null ? cell : 32;
      Map.__super__.constructor.call(this, 0, 0, this.cell);
      this._map = this.load(maps.debug);
    }
    Map.prototype.find = function(arr, pos) {
      var i, _i, _len;
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        i = arr[_i];
        if (i.pos[0] === pos[0] && i.pos[1] === pos[1]) {
          return i;
        }
      }
      return null;
    };
    Map.prototype.gen_blocked_map = function() {
      var m, map;
      map = this.gen_map();
      m = base_block;
      m = rjoin(m, m);
      m = sjoin(m, m);
      return map;
    };
    Map.prototype.load = function(text) {
      var i, map, max, row, tmap, y, _ref;
      tmap = text.replaceAll(".", "0").replaceAll(" ", "1").split("\n");
      max = Math.max.apply(null, (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = tmap.length; _i < _len; _i++) {
          row = tmap[_i];
          _results.push(row.length);
        }
        return _results;
      })());
      map = [];
      for (y = 0, _ref = tmap.length; 0 <= _ref ? y < _ref : y > _ref; 0 <= _ref ? y++ : y--) {
        map[y] = (function() {
          var _results;
          _results = [];
          for (i = 0; 0 <= max ? i < max : i > max; 0 <= max ? i++ : i--) {
            _results.push((i < tmap[y].length ? parseInt(tmap[y][i]) : 1));
          }
          return _results;
        })();
      }
      map = this._rotate90(map);
      map = this._set_wall(map);
      return map;
    };
    Map.prototype.gen_random_map = function(x, y) {
      var i, j, map;
      map = [];
      for (i = 0; 0 <= x ? i < x : i > x; 0 <= x ? i++ : i--) {
        map[i] = [];
        for (j = 0; 0 <= y ? j < y : j > y; 0 <= y ? j++ : j--) {
          if ((i === 0 || i === (x - 1)) || (j === 0 || j === (y - 1))) {
            map[i][j] = 1;
          } else if (Math.random() < 0.2) {
            map[i][j] = 1;
          } else {
            map[i][j] = 0;
          }
        }
      }
      return map;
    };
    Map.prototype.get_point = function(x, y) {
      return {
        x: ~~((x + 1 / 2) * this.cell),
        y: ~~((y + 1 / 2) * this.cell)
      };
    };
    Map.prototype.get_cell = function(x, y) {
      x = ~~(x / this.cell);
      y = ~~(y / this.cell);
      return {
        x: x,
        y: y
      };
    };
    Map.prototype.get_rand_cell_xy = function() {
      var rx, ry;
      rx = ~~(Math.random() * this._map.length);
      ry = ~~(Math.random() * this._map[0].length);
      if (this._map[rx][ry]) {
        return this.get_rand_cell_xy();
      }
      return [rx, ry];
    };
    Map.prototype.get_rand_xy = function() {
      var rx, ry;
      rx = ~~(Math.random() * this._map.length);
      ry = ~~(Math.random() * this._map[0].length);
      if (this._map[rx][ry]) {
        return this.get_rand_xy();
      }
      return this.get_point(rx, ry);
    };
    Map.prototype.collide = function(x, y) {
      x = ~~(x / this.cell);
      y = ~~(y / this.cell);
      return this._map[x][y];
    };
    Map.prototype.search_path = function(start, goal) {
      var close_list, dist, i, max_depth, min_node, n, n_gs, nx, ny, obj, open_list, path, search_path, start_node, _, _i, _len, _ref;
      path = [];
      Node.prototype.start = start;
      Node.prototype.goal = goal;
      open_list = [];
      close_list = [];
      start_node = new Node(Node.prototype.start);
      start_node.fs = start_node.hs;
      open_list.push(start_node);
      search_path = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
      max_depth = 100;
      for (_ = 1; 1 <= max_depth ? _ <= max_depth : _ >= max_depth; 1 <= max_depth ? _++ : _--) {
        if (open_list.size() < 1) {
          return [];
        }
        open_list.sort(function(a, b) {
          return a.fs - b.fs;
        });
        min_node = open_list[0];
        close_list.push(open_list.shift());
        if (min_node.pos[0] === min_node.goal[0] && min_node.pos[1] === min_node.goal[1]) {
          path = [];
          n = min_node;
          while (n.parent) {
            path.push(n.pos);
            n = n.parent;
          }
          return path.reverse();
        }
        n_gs = min_node.fs - min_node.hs;
        for (_i = 0, _len = search_path.length; _i < _len; _i++) {
          i = search_path[_i];
          _ref = [i[0] + min_node.pos[0], i[1] + min_node.pos[1]], nx = _ref[0], ny = _ref[1];
          if (!this._map[nx][ny]) {
            dist = Math.pow(min_node.pos[0] - nx, 2) + Math.pow(min_node.pos[1] - ny, 2);
            if (obj = this.find(open_list, [nx, ny])) {
              if (obj.fs > n_gs + obj.hs + dist) {
                obj.fs = n_gs + obj.hs + dist;
                obj.parent = min_node;
              }
            } else if (obj = this.find(close_list, [nx, ny])) {
              if (obj.fs > n_gs + obj.hs + dist) {
                obj.fs = n_gs + obj.hs + dist;
                obj.parent = min_node;
                open_list.push(obj);
                close_list.remove(obj);
              }
            } else {
              n = new Node([nx, ny]);
              n.fs = n_gs + n.hs + dist;
              n.parent = min_node;
              open_list.push(n);
            }
          }
        }
      }
      return [];
    };
    Map.prototype.render = function(g, cam) {
      var color, i, j, pos, _ref, _results;
      pos = this.getpos_relative(cam);
      _results = [];
      for (i = 0, _ref = this._map.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (j = 0, _ref2 = this._map[i].length; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
            _results2.push(this._map[i][j] ? g.init(color = Color.i(30, 30, 30)) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    Map.prototype.render_after = function(g, cam) {
      var alpha, i, j, pos, x, y, _ref, _results;
      pos = this.getpos_relative(cam);
      _results = [];
      for (i = 0, _ref = this._map.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (j = 0, _ref2 = this._map[i].length; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
            _results2.push(this._map[i][j] ? (g.init(Color.i(50, 50, 50), alpha = 1), x = pos.vx + i * this.cell, y = pos.vy + j * this.cell, (-this.cell < x && x < 640) && (-this.cell < y && y < 480) ? g.fillRect(x, y, this.cell, this.cell) : void 0) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    Map.prototype._rotate90 = function(map) {
      var i, j, res, _ref;
      res = [];
      for (i = 0, _ref = map[0].length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        res[i] = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = map.length; _i < _len; _i++) {
            j = map[_i];
            _results.push(j[i]);
          }
          return _results;
        })();
      }
      return res;
    };
    Map.prototype._set_wall = function(map) {
      var i, x, y, _i, _len;
      x = map.length;
      y = map[0].length;
      map[0] = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = map[0].length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push(1);
        }
        return _results;
      })();
      map[map.length - 1] = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = map[0].length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push(1);
        }
        return _results;
      })();
      for (_i = 0, _len = map.length; _i < _len; _i++) {
        i = map[_i];
        i[0] = 1;
        i[i.length - 1] = 1;
      }
      return map;
    };
    return Map;
  })();
  SampleMap = (function() {
    __extends(SampleMap, Map);
    SampleMap.prototype.max_object_count = 18;
    SampleMap.prototype.frame_count = 0;
    function SampleMap(context, cell) {
      this.context = context;
      this.cell = cell != null ? cell : 32;
      SampleMap.__super__.constructor.call(this, this.cell);
      this._map = this.load(maps.filed1);
    }
    SampleMap.prototype.update = function(objs, camera) {
      this._sweep(objs, camera);
      return this._pop_monster(objs);
    };
    SampleMap.prototype._sweep = function(objs, camera) {
      var i, player, start_point, _ref, _results;
      _results = [];
      for (i = 0, _ref = objs.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        if (objs[i].is_dead() && objs[i].cnt > 120) {
          if (objs[i] === camera) {
            start_point = this.get_rand_xy();
            player = new Player(this.context, start_point.x, start_point.y, 0);
            this.context.set_camera(player);
            objs.push(player);
            objs.splice(i, 1);
          } else {
            objs.splice(i, 1);
          }
          break;
        }
      }
      return _results;
    };
    SampleMap.prototype._pop_monster = function(objs) {
      var group, random_point;
      if (objs.length < this.max_object_count && this.frame_count % 60 * 3 === 0) {
        random_point = this.get_rand_xy();
        if (Math.random() < 0.9) {
          group = (Math.random() > 0.05 ? ObjectGroup.Enemy : ObjectGroup.Player);
          return objs.push(new Goblin(random_point.x, random_point.y, group));
        } else {
          return objs.push(new MoneyObject(random_point.x, random_point.y));
        }
      }
    };
    return SampleMap;
  })();
  Node = (function() {
    Node.prototype.start = [null, null];
    Node.prototype.goal = [null, null];
    function Node(pos) {
      this.pos = pos;
      this.owner_list = null;
      this.parent = null;
      this.hs = Math.pow(pos[0] - this.goal[0], 2) + Math.pow(pos[1] - this.goal[1], 2);
      this.fs = 0;
    }
    Node.prototype.is_goal = function(self) {
      return this.goal === this.pos;
    };
    return Node;
  })();
  maps = {
    filed1: "\n                                           .........\n                                    ................... .\n                               ...........            ......\n                            ....                      ..........\n                         .....              .....        ...... .......\n                 ..........              .........        ............ .....\n                 ............          ...... . ....        ............ . ..\n             .....    ..    ...        ..  ..........       . ..................\n     ..     ......          .........................       . .......   ...... ..\n    .....    ...     ..        .......  ...............      ....        ........\n  ...... ......    .....         ..................... ..   ....         ........\n  .........   ......  ...............  ................... ....            ......\n ...........    ... ... .... .   ..   .. ........ ............             . .....\n ...........    ...... ...       ....................           ......\n............   .......... .    .......... ...... .. .       ...........\n .. ........ .......   ....   ...... .   ............      .... .......\n . ..............       .... .. .       ..............   ...... ..... ..\n  .............          .......       ......       ......... . ...... .\n  ..     .... ..         ... .       ....         .........   ...........\n ...       .......   ........       .. .        .... ....  ... ..........\n.. .         ......  .........      .............. ..  .....  ...    .....\n.....         ......................................      ....        ....\n .....       ........    ... ................... ....     ...        ....\n   ....   ........        ...........................  .....        .....\n   ...........  ..        ........ .............. ... .. .         .....\n       ......                 .........................           .. ..\n                                .....................          .......\n                                    ...................        ......\n                                        .............",
    debug: "             ....\n          ...........\n        ..............\n      .... ........... .\n     .......  ..  ........\n.........    ..     ......\n........   ......    .......\n.........   .....    .......\n .................. ........\n     .......................\n     ....................\n           .............\n              ......\n               ...\n"
  };
  base_block = [[1, 1, 0, 1, 1], [1, 0, 0, 1, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 1, 0, 1, 1]];
  Character = (function() {
    __extends(Character, Sprite);
    Character.prototype.scale = null;
    Character.prototype.state = null;
    Character.prototype.following_obj = null;
    Character.prototype.targeting_obj = null;
    Character.prototype.status = {};
    Character.prototype._items_ = [];
    function Character(x, y, group, status) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.group = group != null ? group : ObjectGroup.Enemy;
      if (status == null) {
        status = {};
      }
      Character.__super__.constructor.call(this, this.x, this.y);
      this.state = {
        active: false
      };
      this.targeting_obj = null;
      this.dir = 0;
      this.cnt = 0;
      this.id = ~~(Math.random() * 100);
      this.animation = [];
      this.cnt = ~~(Math.random() * 60);
      this.distination = [this.x, this.y];
      this._path = [];
    }
    Character.prototype.regenerate = function() {
      var r;
      r = (this.targeting_obj ? 2 : 1);
      if (this.is_alive()) {
        if (this.status.hp < this.status.MAX_HP) {
          return this.status.hp += 1;
        }
      }
    };
    Character.prototype.update = function(objs, cmap) {
      this.cnt += 1;
      if (this.is_alive()) {
        this.check();
        if (this.cnt % 60 === 0) {
          this.regenerate();
        }
        this.search(objs);
        this.move(objs, cmap);
        this.change_skill();
        return this.selected_skill.update(objs);
      }
    };
    Character.prototype.search = function(objs) {
      var enemies;
      enemies = this.find_obj(ObjectGroup.get_against(this), objs, this.status.sight_range);
      if (this.has_target()) {
        if (this.targeting_obj.is_dead() || this.get_distance(this.targeting_obj) > this.status.sight_range * 1.5) {
          Sys.prototype.message("" + this.name + " lost track of " + this.targeting_obj.name);
          return this.targeting_obj = null;
        }
      } else if (enemies.size() > 0) {
        this.targeting_obj = enemies[0];
        return Sys.prototype.message("" + this.name + " find " + this.targeting_obj.name);
      }
    };
    Character.prototype.move = function(objs, cmap) {
      var c, dp, nx, ny, wide, _ref;
      if (this.has_target()) {
        this.set_dir(this.targeting_obj.x, this.targeting_obj.y);
        if (this.get_distance(this.targeting_obj) < this.selected_skill.range) {
          return;
        }
      } else {
        if (this.cnt % 60 < 15) {
          return;
        }
      }
      if (this.has_target() && this.cnt % 60 === 0) {
        this._update_path(cmap);
      }
      if (this.to) {
        dp = cmap.get_point(this.to[0], this.to[1]);
        _ref = this._trace(dp.x, dp.y), nx = _ref[0], ny = _ref[1];
        wide = this.status.speed;
        if ((dp.x - wide < nx && nx < dp.x + wide) && (dp.y - wide < ny && ny < dp.y + wide)) {
          if (this._path.length > 0) {
            this.to = this._path.shift();
          } else {
            this.to = null;
          }
        }
      } else {
        if (this.has_target()) {
          this._update_path(cmap);
        } else {
          c = cmap.get_cell(this.x, this.y);
          this.to = [c.x + randint(-1, 1), c.y + randint(-1, 1)];
        }
      }
      if (!cmap.collide(nx, ny)) {
        if (nx != null) {
          this.x = nx;
        }
        if (ny != null) {
          this.y = ny;
        }
      }
      if (this.x === this._lx_ && this.y === this._ly_) {
        c = cmap.get_cell(this.x, this.y);
        this.to = [c.x + randint(-1, 1), c.y + randint(-1, 1)];
      }
      this._lx_ = this.x;
      return this._ly_ = this.y;
    };
    Character.prototype.equip = function(item) {
      var k, v, _ref;
      if (_ref = item.at, __indexOf.call((function() {
        var _ref2, _results;
        _ref2 = this._equips_;
        _results = [];
        for (k in _ref2) {
          v = _ref2[k];
          _results.push(k);
        }
        return _results;
      }).call(this), _ref) >= 0) {
        this._equips_[item.at] = item;
      }
      return false;
    };
    Character.prototype.get_item = function(item) {
      return this._items_.push(item);
    };
    Character.prototype.use_item = function(item) {
      return this._items_.remove(item);
    };
    Character.prototype.get_param = function(param) {
      var at, item;
      return ((function() {
        var _ref, _results;
        _ref = this._equips_;
        _results = [];
        for (at in _ref) {
          item = _ref[at];
          _results.push((item != null ? item[param] : void 0) || 0);
        }
        return _results;
      }).call(this)).reduce(function(x, y) {
        return x + y;
      });
    };
    Character.prototype.die = function(actor) {
      var gold;
      this.cnt = 0;
      if (this.group === ObjectGroup.Enemy) {
        gold = randint(0, 100);
        GameData.gold += gold;
      }
      actor.status.get_exp(this.status.lv * 10);
      if (actor) {
        Sys.prototype.message("" + this.name + " is killed by " + actor.name + ".");
      }
      if (gold) {
        return Sys.prototype.message("You got " + gold + "G.");
      }
    };
    Character.prototype.add_damage = function(actor, amount) {
      var before;
      before = this.is_alive();
      this.status.hp -= amount;
      if (this.is_dead() && before) {
        this.die(actor);
      }
      return this.is_alive();
    };
    Character.prototype.set_skill = function() {
      var k, v, _ref, _results;
      _ref = this.keys;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        if (v && (k === "zero" || k === "one" || k === "two" || k === "three" || k === "four" || k === "five" || k === "six" || k === "seven" || k === "eight" || k === "nine")) {
          this.selected_skill = this.skills[k];
          break;
        }
      }
      return _results;
    };
    Character.prototype._update_path = function(cmap) {
      this._path = this._get_path(cmap);
      return this.to = this._path.shift();
    };
    Character.prototype._get_path = function(map) {
      var from, to;
      from = map.get_cell(this.x, this.y);
      to = map.get_cell(this.targeting_obj.x, this.targeting_obj.y);
      return map.search_path([from.x, from.y], [to.x, to.y]);
    };
    Character.prototype._trace = function(to_x, to_y) {
      this.set_dir(to_x, to_y);
      return [this.x + ~~(this.status.speed * Math.cos(this.dir)), this.y + ~~(this.status.speed * Math.sin(this.dir))];
    };
    Character.prototype.has_target = function() {
      if (this.targeting_obj !== null) {
        return true;
      } else {
        return false;
      }
    };
    Character.prototype.is_following = function() {
      if (this.following_obj !== null) {
        return true;
      } else {
        return false;
      }
    };
    Character.prototype.is_alive = function() {
      return this.status.hp > 1;
    };
    Character.prototype.is_dead = function() {
      return !this.is_alive();
    };
    Character.prototype.find_obj = function(group_id, targets, range) {
      return targets.filter(__bind(function(t) {
        return t.group === group_id && this.get_distance(t) < range && t.is_alive();
      }, this));
    };
    Character.prototype.set_dir = function(x, y) {
      var rx, ry;
      rx = x - this.x;
      ry = y - this.y;
      if (rx >= 0) {
        return this.dir = Math.atan(ry / rx);
      } else {
        return this.dir = Math.PI - Math.atan(ry / -rx);
      }
    };
    Character.prototype.check = function() {
      var _ref;
      if (this.status.hp > this.status.MAX_HP) {
        this.status.hp = this.status.MAX_HP;
      }
      if (this.status.hp < 0) {
        this.status.hp = 0;
      }
      if (this.is_alive()) {
        if ((_ref = this.targeting_obj) != null ? _ref.is_dead() : void 0) {
          return this.targeting_obj = null;
        }
      } else {
        return this.targeting_obj = null;
      }
    };
    Character.prototype.shift_target = function(targets) {
      var cur, _ref;
      if (this.has_target() && targets.length > 0) {
        if (_ref = !this.targeting_obj, __indexOf.call(targets, _ref) >= 0) {
          this.targeting_obj = targets[0];
          return;
        } else if (targets.size() === 1) {
          this.targeting_obj = targets[0];
          return;
        }
        if (targets.size() > 1) {
          cur = targets.indexOf(this.targeting_obj);
          if (cur + 1 >= targets.size()) {
            cur = 0;
          } else {
            cur += 1;
          }
          return this.targeting_obj = targets[cur];
        }
      }
    };
    Character.prototype.add_animation = function(animation) {
      return this.animation.push(animation);
    };
    return Character;
  })();
  CharacterObject = (function() {
    __extends(CharacterObject, Character);
    function CharacterObject() {
      CharacterObject.__super__.constructor.apply(this, arguments);
    }
    CharacterObject.prototype.render_animation = function(g, x, y) {
      var n, _ref, _results;
      _results = [];
      for (n = 0, _ref = this.animation.length; 0 <= _ref ? n < _ref : n > _ref; 0 <= _ref ? n++ : n--) {
        if (!this.animation[n].render(g, x, y)) {
          this.animation.splice(n, 1);
          this.render_animation(g, x, y);
          break;
        }
      }
      return _results;
    };
    CharacterObject.prototype.render_reach_circle = function(g, pos) {
      var alpha;
      g.init();
      g.drawArc(false, pos.vx, pos.vy, this.selected_skill.range);
      g.init(Color.i(50, 50, 50), alpha = 0.3);
      return g.drawArc(false, pos.vx, pos.vy, this.status.sight_range);
    };
    CharacterObject.prototype.render_dir_allow = function(g, pos) {
      g.init(Color.i(255, 0, 0));
      return g.drawLine(pos.vx, pos.vy, ~~(30 * Math.cos(this.dir)), ~~(30 * Math.sin(this.dir)));
    };
    CharacterObject.prototype.render_targeting_obj = function(g, pos, cam) {
      var alpha, color, t, _ref;
      if ((_ref = this.targeting_obj) != null ? _ref.is_alive() : void 0) {
        this.targeting_obj.render_targeted(g, pos);
        g.init(color = "rgb(0,0,255)", alpha = 0.5);
        g.moveTo(pos.vx, pos.vy);
        t = this.targeting_obj.getpos_relative(cam);
        g.lineTo(t.vx, t.vy);
        g.stroke();
        return g.init(color = "rgb(255,0,0)", alpha = 0.6);
      }
    };
    CharacterObject.prototype.render_state = function(g, pos) {
      var color, text;
      g.init();
      this.render_gages(g, pos.vx, pos.vy + 15, 40, 6, this.status.hp / this.status.MAX_HP);
      g.init();
      this.render_gages(g, pos.vx, pos.vy + 22, 40, 6, this.selected_skill.ct / this.selected_skill.MAX_CT);
      if (this.has_target()) {
        text = this.selected_skill.name;
      } else {
        text = "wander";
      }
      color = Color.Grey;
      if (this.has_target()) {
        if (this.get_distance(this.targeting_obj) < this.selected_skill.range) {
          color = Color.i(0, 255, 0);
        }
      }
      g.init(color);
      return g.fillText(text, pos.vx - 17, pos.vy + 35);
    };
    CharacterObject.prototype.render_dead = function(g, pos) {
      var alpha, color;
      g.init(color = 'rgb(128, 0, 0)', alpha = 1 - this.cnt / 120);
      return g.drawArc(true, pos.vx, pos.vy, this.scale);
    };
    CharacterObject.prototype.render_gages = function(g, x, y, w, h, percent) {
      if (percent == null) {
        percent = 1;
      }
      g.init(Color.Green);
      g.strokeRect(x - w / 2, y - h / 2, w, h);
      g.init(Color.Green);
      return g.fillRect(x - w / 2 + 1, y - h / 2 + 1, w * percent, h - 2);
    };
    CharacterObject.prototype.render_targeted = function(g, pos) {
      var beat, color, ms;
      beat = 60;
      ms = ~~(new Date() / 100) % beat / beat;
      if (ms > 0.5) {
        ms = 1 - ms;
      }
      if (this.group === ObjectGroup.Player) {
        color = Color.i(255, 0, 0);
      } else if (this.group === ObjectGroup.Enemy) {
        color = Color.i(0, 0, 255);
      }
      g.init(color, 0.7);
      return g.drawPath(true, [[pos.vx, pos.vy - 12 + ms * 10], [pos.vx - 6 - ms * 5, pos.vy - 20 + ms * 10], [pos.vx + 6 + ms * 5, pos.vy - 20 + ms * 10], [pos.vx, pos.vy - 12 + ms * 10]]);
    };
    CharacterObject.prototype.render = function(g, cam) {
      var pos;
      g.init();
      pos = this.getpos_relative(cam);
      if (this.is_alive()) {
        this.render_object(g, pos);
        this.render_state(g, pos);
        this.render_targeting_obj(g, pos, cam);
      } else {
        this.render_dead(g, pos);
      }
      return this.render_animation(g, pos.vx, pos.vy);
    };
    return CharacterObject;
  })();
  Goblin = (function() {
    __extends(Goblin, CharacterObject);
    Goblin.prototype.name = "Goblin";
    Goblin.prototype.scale = 1;
    function Goblin(x, y, group) {
      this.x = x;
      this.y = y;
      this.group = group;
      this.dir = 0;
      this.status = new Status({
        str: 8,
        int: 4,
        dex: 6
      });
      Goblin.__super__.constructor.call(this, this.x, this.y, this.group, this.status);
      this.skills = {
        one: new Skill_Atack(this, 3),
        two: new Skill_Heal(this)
      };
      this.selected_skill = this.skills['one'];
      this._equips_ = {
        main_hand: new Weapons.prototype.Dagger,
        sub_hand: null,
        body: null
      };
    }
    Goblin.prototype.change_skill = function() {
      if (this.status.hp < 10) {
        return this.selected_skill = this.skills['two'];
      } else {
        return this.selected_skill = this.skills['one'];
      }
    };
    Goblin.prototype.render_object = function(g, pos) {
      var beat, color, ms;
      if (this.group === ObjectGroup.Player) {
        color = Color.White;
      } else {
        color = Color.Black;
      }
      g.init(color);
      beat = 20;
      ms = ~~(new Date() / 100) % beat / beat;
      if (ms > 0.5) {
        ms = 1 - ms;
      }
      g.drawArc(true, pos.vx, pos.vy, ~~(1.3 + ms) * this.scale);
      g.init(Color.Grey);
      return g.fillText("" + this.name, pos.vx - 15, pos.vy - 12);
    };
    Goblin.prototype.die = function(actor) {
      Goblin.__super__.die.call(this, actor);
      return actor.get_item(new Weapons.prototype.Dagger);
    };
    Goblin.prototype.exec = function(actor, objs) {
      Goblin.__super__.exec.call(this, actor, objs);
      if (actor.has_target()) {
        return actor.targeting_obj.add_animation(new Anim.prototype[this.effect](amount, this.size));
      }
    };
    return Goblin;
  })();
  Player = (function() {
    __extends(Player, CharacterObject);
    Player.prototype.scale = 8;
    Player.prototype.name = "Player";
    function Player(scene, x, y, group) {
      this.scene = scene;
      this.x = x;
      this.y = y;
      this.group = group != null ? group : ObjectGroup.Player;
      Player.__super__.constructor.call(this, this.x, this.y, this.group);
      this.status = new Status({
        str: 10,
        int: 10,
        dex: 10
      });
      this.skills = {
        one: new Skill_Atack(this),
        two: new Skill_Smash(this),
        three: new Skill_Heal(this),
        four: new Skill_Meteor(this)
      };
      this.selected_skill = this.skills['one'];
      this._equips_ = {
        main_hand: new Weapons.prototype.Blade,
        sub_hand: null,
        body: null
      };
      if (typeof window !== "undefined" && window !== null) {
        this.mouse = this.scene.core.mouse;
      }
      if (typeof window !== "undefined" && window !== null) {
        this.keys = this.scene.core.keys;
      }
    }
    Player.prototype.change_skill = function() {
      return this.set_skill(this.keys);
    };
    Player.prototype.update = function(objs, cmap) {
      var enemies;
      enemies = this.find_obj(ObjectGroup.get_against(this), objs, this.status.sight_range);
      if (this.keys.space === 2) {
        this.shift_target(enemies);
      }
      return Player.__super__.update.call(this, objs, cmap);
    };
    Player.prototype.set_mouse_dir = function(x, y) {
      var rx, ry;
      rx = x - 320;
      ry = y - 240;
      if (rx > 0) {
        return this.dir = Math.atan(ry / rx);
      } else {
        return this.dir = Math.PI - Math.atan(ry / -rx);
      }
    };
    Player.prototype.move = function(objs, cmap) {
      var keys, move;
      keys = this.keys;
      if (keys.right + keys.left + keys.up + keys.down > 1) {
        move = ~~(this.status.speed * Math.sqrt(2) / 2);
      } else {
        move = this.status.speed;
      }
      if (keys.right) {
        if (cmap.collide(this.x + move, this.y)) {
          this.x = (~~(this.x / cmap.cell) + 1) * cmap.cell - 1;
        } else {
          this.x += move;
        }
      }
      if (keys.left) {
        if (cmap.collide(this.x - move, this.y)) {
          this.x = (~~(this.x / cmap.cell)) * cmap.cell + 1;
        } else {
          this.x -= move;
        }
      }
      if (keys.up) {
        if (cmap.collide(this.x, this.y - move)) {
          this.y = (~~(this.y / cmap.cell)) * cmap.cell + 1;
        } else {
          this.y -= move;
        }
      }
      if (keys.down) {
        if (cmap.collide(this.x, this.y + move)) {
          return this.y = (~~(this.y / cmap.cell + 1)) * cmap.cell - 1;
        } else {
          return this.y += move;
        }
      }
    };
    Player.prototype.render_object = function(g, pos) {
      var beat, color, ms, roll;
      beat = 20;
      ms = ~~(new Date() / 100) % beat / beat;
      if (ms > 0.5) {
        ms = 1 - ms;
      }
      if (this.group === ObjectGroup.Player) {
        color = Color.White;
      } else if (this.group === ObjectGroup.Enemy) {
        color = Color.i(55, 55, 55);
      }
      g.init(color);
      g.drawArc(true, pos.vx, pos.vy, (1.3 - ms) * this.scale);
      roll = Math.PI * (this.cnt % 20) / 10;
      g.init(Color.i(128, 100, 162));
      g.drawArc(true, 320, 240, this.scale * 0.5);
      g.init(Color.White);
      return g.fillText("" + this.name, 305, 228);
    };
    Player.prototype.render = function(g, cam) {
      Player.__super__.render.call(this, g, cam);
      return this.render_mouse(g);
    };
    Player.prototype.render_skill_gage = function(g) {
      var c, color, number, skill, _ref, _results;
      c = 0;
      _ref = this.skills;
      _results = [];
      for (number in _ref) {
        skill = _ref[number];
        color = Color.Grey;
        if (this.has_target()) {
          if (this.get_distance(this.targeting_obj) < skill.range) {
            color = Color.i(0, 255, 0);
          }
        }
        g.init(color);
        g.fillText("[" + (c + 1) + "]" + skill.name, 20 + c * 50, 30);
        this.render_gages(g, 40 + c * 50, 40, 40, 6, skill.ct / skill.MAX_CT);
        _results.push(c++);
      }
      return _results;
    };
    Player.prototype.render_mouse = function(g) {
      if (this.mouse) {
        g.init(Color.i(200, 200, 50));
        g.arc(this.mouse.x, this.mouse.y, this.scale, 0, Math.PI * 2, true);
        return g.stroke();
      }
    };
    return Player;
  })();
  ObjectGroup = {
    Player: 0,
    Enemy: 1,
    Item: 2,
    is_battler: function(group_id) {
      return group_id === this.Player || group_id === this.Enemy;
    },
    get_against: function(obj) {
      switch (obj.group) {
        case this.Player:
          return this.Enemy;
        case this.Enemy:
          return this.Player;
      }
    }
  };
  Status = (function() {
    function Status(params, equips, lv) {
      if (params == null) {
        params = {};
      }
      if (equips == null) {
        equips = {};
      }
      this.lv = lv != null ? lv : 1;
      this.build_status(params, equips);
      this.hp = this.MAX_HP;
      this.sp = this.MAX_SP;
      this.exp = 0;
      this.next_lv = this.lv * 50;
      this.STR = params.str;
      this.INT = params.int;
      this.DEX = params.dex;
    }
    Status.prototype.build_status = function(params, equips) {
      if (params == null) {
        params = {};
      }
      this.MAX_HP = params.str * 10;
      this.MAX_SP = params.int * 10;
      this.atk = params.str;
      this.mgc = params.int;
      this.def = params.str / 10;
      this.res = params.int;
      this.regenerate = ~~(params.str / 10);
      this.sight_range = params.dex * 20;
      return this.speed = ~~(params.dex * 0.5);
    };
    Status.prototype.level_up = function() {
      this.lv++;
      [this.STR++, this.INT++, this.DEX++];
      this.exp = 0;
      this.next_lv = this.lv * 50;
      return this.build_status({
        str: this.STR,
        int: this.INT,
        dex: this.DEX
      });
    };
    Status.prototype.get_exp = function(point) {
      this.exp += point;
      if (this.exp >= this.next_lv) {
        this.level_up();
        return Sys.prototype.message('you level up! to lv.' + this.lv);
      }
    };
    Status.prototype.set_next_exp = function() {
      return this.next_lv = this.lv * 30;
    };
    Status.prototype.onDamaged = function(amount) {};
    Status.prototype.onHealed = function(amount) {};
    return Status;
  })();
  Item = (function() {
    function Item() {}
    return Item;
  })();
  EquipItem = (function() {
    __extends(EquipItem, Item);
    function EquipItem() {
      EquipItem.__super__.constructor.apply(this, arguments);
    }
    EquipItem.prototype.weight = 1;
    EquipItem.prototype.a_slash = 0;
    EquipItem.prototype.a_thrust = 0;
    EquipItem.prototype.a_blow = 0;
    EquipItem.prototype.a_fire = 0;
    EquipItem.prototype.a_flost = 0;
    EquipItem.prototype.a_thunder = 0;
    EquipItem.prototype.a_holy = 0;
    EquipItem.prototype.a_darkness = 0;
    EquipItem.prototype.r_slash = 0;
    EquipItem.prototype.r_thrust = 0;
    EquipItem.prototype.r_blow = 0;
    EquipItem.prototype.r_fire = 0;
    EquipItem.prototype.r_flost = 0;
    EquipItem.prototype.r_thunder = 0;
    EquipItem.prototype.r_holy = 0;
    EquipItem.prototype.r_darkness = 0;
    return EquipItem;
  })();
  Weapon = (function() {
    __extends(Weapon, EquipItem);
    function Weapon() {
      Weapon.__super__.constructor.apply(this, arguments);
    }
    Weapon.prototype.type = 'weapon';
    return Weapon;
  })();
  Armor = (function() {
    __extends(Armor, EquipItem);
    function Armor() {
      Armor.__super__.constructor.apply(this, arguments);
    }
    Armor.prototype.type = 'armor';
    return Armor;
  })();
  (Weapons = {}).prototype = {
    Dagger: Dagger = (function() {
      __extends(Dagger, Weapon);
      function Dagger() {
        Dagger.__super__.constructor.apply(this, arguments);
      }
      Dagger.prototype.name = 'Dagger';
      Dagger.prototype.at = "main_hand";
      Dagger.prototype.a_slash = 0.7;
      Dagger.prototype.weight = 0.2;
      return Dagger;
    })(),
    Blade: Blade = (function() {
      __extends(Blade, Weapon);
      function Blade() {
        Blade.__super__.constructor.apply(this, arguments);
      }
      Blade.prototype.name = 'Blade';
      Blade.prototype.at = "main_hand";
      Blade.prototype.a_slash = 1.1;
      Blade.prototype.weight = 2.9;
      return Blade;
    })(),
    SmallShield: SmallShield = (function() {
      __extends(SmallShield, Weapon);
      function SmallShield() {
        SmallShield.__super__.constructor.apply(this, arguments);
      }
      SmallShield.prototype.name = 'SmallShiled';
      SmallShield.prototype.at = "sub_hand";
      SmallShield.prototype.r_slash = 0.1;
      return SmallShield;
    })(),
    ClothArmor: ClothArmor = (function() {
      __extends(ClothArmor, Armor);
      function ClothArmor() {
        ClothArmor.__super__.constructor.apply(this, arguments);
      }
      ClothArmor.prototype.name = 'ClothArmor';
      ClothArmor.prototype.at = "body";
      ClothArmor.prototype.r_slash = 0.2;
      return ClothArmor;
    })()
  };
  UseItem = (function() {
    __extends(UseItem, Item);
    function UseItem() {
      UseItem.__super__.constructor.apply(this, arguments);
    }
    UseItem.prototype.type = 'use';
    UseItem.prototype.effect = function(actor) {};
    return UseItem;
  })();
  ItemBox = (function() {
    function ItemBox() {}
    ItemBox.prototype.items = [];
    ItemBox.prototype.serialize = function() {
      var buf, i, k, v, _i, _j, _len, _len2, _ref, _ref2, _ref3;
      buf = [];
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _ref2 = (function() {
          var _results;
          _results = [];
          for (k in i) {
            v = i[k];
            _results.push([k, v]);
          }
          return _results;
        })();
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          _ref3 = _ref2[_j], k = _ref3[0], v = _ref3[1];
          buf.push;
        }
      }
      if (typeof localStorage !== "undefined" && localStorage !== null) {
        return localStorage.set(JSON.stringify(buf));
      } else {
        return this._storage_ = JSON.stringify(buf);
      }
    };
    ItemBox.prototype.load = function(str) {
      return console.log(eval(this._storage_));
    };
    ItemBox.prototype.add_item = function(item) {
      return this.items.push(item);
    };
    ItemBox.prototype.remove_item = function(item) {
      return this.items.remove(item);
    };
    return ItemBox;
  })();
  Skill = (function() {
    function Skill(actor, lv) {
      this.actor = actor;
      this.lv = lv != null ? lv : 1;
      this._build(this.lv);
      this.MAX_CT = this.CT * 60;
      this.ct = this.MAX_CT;
    }
    Skill.prototype.charge = function(is_selected) {
      if (this.ct < this.MAX_CT) {
        if (is_selected) {
          return this.ct += this.fg_charge;
        } else {
          return this.ct += this.bg_charge;
        }
      }
    };
    Skill.prototype.update = function(objs, keys) {
      var name, skill, _ref;
      _ref = this.actor.skills;
      for (name in _ref) {
        skill = _ref[name];
        skill.charge(this, skill === this);
      }
      return this.exec(objs);
    };
    Skill.prototype.exec = function(objs) {};
    Skill.prototype._build = function(lv) {};
    Skill.prototype._calc = function(target) {
      return 1;
    };
    Skill.prototype._get_targets = function(objs) {
      return [];
    };
    return Skill;
  })();
  DamageHit = (function() {
    __extends(DamageHit, Skill);
    function DamageHit() {
      DamageHit.__super__.constructor.apply(this, arguments);
    }
    DamageHit.prototype.range = 30;
    DamageHit.prototype.auto = true;
    DamageHit.prototype.CT = 1;
    DamageHit.prototype.bg_charge = 0.2;
    DamageHit.prototype.fg_charge = 1;
    DamageHit.prototype.damage_rate = 1.0;
    DamageHit.prototype.random_rate = 0.2;
    DamageHit.prototype.effect = 'Slash';
    DamageHit.prototype._calc_rate = function(target, e) {
      return this.actor.get_param("a_" + e) * (1 - target.get_param("r_" + e));
    };
    DamageHit.prototype._get_random = function() {
      return randint(100 * (1 - this.random_rate), 100 * (1 + this.random_rate)) / 100;
    };
    DamageHit.prototype.exec = function(objs) {
      var amount, t, targets, _i, _len;
      targets = this._get_targets(objs);
      if (this.ct >= this.MAX_CT && targets.size() > 0) {
        for (_i = 0, _len = targets.length; _i < _len; _i++) {
          t = targets[_i];
          amount = this._calc(t);
          t.add_damage(this.actor, amount);
          t.add_animation(new Anim.prototype[this.effect](amount));
        }
        this.ct = 0;
        return true;
      }
      return false;
    };
    return DamageHit;
  })();
  SingleHit = (function() {
    __extends(SingleHit, DamageHit);
    function SingleHit() {
      SingleHit.__super__.constructor.apply(this, arguments);
    }
    SingleHit.prototype.effect = 'Slash';
    SingleHit.prototype._get_targets = function(objs) {
      if (this.actor.has_target()) {
        if (this.actor.get_distance(this.actor.targeting_obj) < this.range) {
          return [this.actor.targeting_obj];
        }
      }
      return [];
    };
    SingleHit.prototype._calc = function(target) {
      var damage;
      damage = ~~(this.actor.status.STR * this._calc_rate(target, 'slash'));
      return ~~(damage * this.damage_rate * this._get_random());
    };
    return SingleHit;
  })();
  AreaHit = (function() {
    __extends(AreaHit, DamageHit);
    function AreaHit() {
      AreaHit.__super__.constructor.apply(this, arguments);
    }
    AreaHit.prototype.effect = 'Burn';
    AreaHit.prototype._get_targets = function(objs) {
      return this.actor.find_obj(ObjectGroup.get_against(this.actor), objs, this.range);
    };
    AreaHit.prototype._calc = function(target) {
      return ~~(this.actor.status.atk * target.status.def * this.damage_rate * randint(100 * (1 - this.random_rate), 100 * (1 + this.random_rate)) / 100);
    };
    return AreaHit;
  })();
  TargetAreaHit = (function() {
    __extends(TargetAreaHit, DamageHit);
    function TargetAreaHit() {
      TargetAreaHit.__super__.constructor.apply(this, arguments);
    }
    TargetAreaHit.prototype.effect = 'Burn';
    TargetAreaHit.prototype._get_targets = function(objs) {
      if (this.actor.has_target()) {
        if (this.actor.get_distance(this.actor.targeting_obj) < this.range) {
          return this.actor.targeting_obj.find_obj(ObjectGroup.get_against(this.actor), objs, this.range);
        }
      }
      return [];
    };
    TargetAreaHit.prototype._calc = function(target) {
      return ~~(this.actor.status.atk * target.status.def * this.damage_rate * randint(100 * (1 - this.random_rate), 100 * (1 + this.random_rate)) / 100);
    };
    TargetAreaHit.prototype.exec = function(objs) {
      var res;
      res = TargetAreaHit.__super__.exec.call(this, objs);
      if (res) {
        return this.actor.targeting_obj.add_animation(new Anim.prototype[this.effect](null, this.range * 1.5));
      }
    };
    return TargetAreaHit;
  })();
  Skill_Atack = (function() {
    __extends(Skill_Atack, SingleHit);
    function Skill_Atack() {
      Skill_Atack.__super__.constructor.apply(this, arguments);
    }
    Skill_Atack.prototype.name = "Atack";
    Skill_Atack.prototype.range = 60;
    Skill_Atack.prototype.CT = 1;
    Skill_Atack.prototype.auto = true;
    Skill_Atack.prototype.bg_charge = 0.2;
    Skill_Atack.prototype.fg_charge = 1;
    Skill_Atack.prototype.damage_rate = 1.0;
    Skill_Atack.prototype.random_rate = 0.2;
    Skill_Atack.prototype._build = function(lv) {
      this.range -= lv;
      this.CT -= lv / 40;
      this.bg_charge += lv / 20;
      this.fg_charge -= lv / 20;
      return this.damage_rate += lv / 20;
    };
    return Skill_Atack;
  })();
  Skill_Smash = (function() {
    __extends(Skill_Smash, SingleHit);
    function Skill_Smash() {
      Skill_Smash.__super__.constructor.apply(this, arguments);
    }
    Skill_Smash.prototype.name = "Smash";
    Skill_Smash.prototype.range = 30;
    Skill_Smash.prototype.CT = 2;
    Skill_Smash.prototype.damage_rate = 2.2;
    Skill_Smash.prototype.random_rate = 0.5;
    Skill_Smash.prototype.bg_charge = 0.5;
    Skill_Smash.prototype.fg_charge = 1;
    Skill_Smash.prototype._build = function(lv) {
      this.range -= lv;
      this.CT -= lv / 10;
      this.bg_charge += lv / 20;
      this.fg_charge -= lv / 20;
      return this.damage_rate += lv / 20;
    };
    Skill_Smash.prototype._calc = function(target) {
      return ~~(this.actor.status.atk * target.status.def * this.damage_rate * randint(100 * (1 - this.random_rate), 100 * (1 + this.random_rate)) / 100);
    };
    return Skill_Smash;
  })();
  Skill_Meteor = (function() {
    __extends(Skill_Meteor, AreaHit);
    function Skill_Meteor() {
      Skill_Meteor.__super__.constructor.apply(this, arguments);
    }
    Skill_Meteor.prototype.name = "Meteor";
    Skill_Meteor.prototype.range = 80;
    Skill_Meteor.prototype.auto = true;
    Skill_Meteor.prototype.CT = 4;
    Skill_Meteor.prototype.damage_rate = 5;
    Skill_Meteor.prototype.random_rate = 0.1;
    Skill_Meteor.prototype.bg_charge = 0.5;
    Skill_Meteor.prototype.fg_charge = 1;
    Skill_Meteor.prototype.effect = 'Burn';
    Skill_Meteor.prototype._calc = function(target) {
      return ~~(this.actor.status.atk * target.status.def * this.damage_rate * randint(100 * (1 - this.random_rate), 100 * (1 + this.random_rate)) / 100);
    };
    return Skill_Meteor;
  })();
  Skill_Heal = (function() {
    __extends(Skill_Heal, Skill);
    function Skill_Heal() {
      Skill_Heal.__super__.constructor.apply(this, arguments);
    }
    Skill_Heal.prototype.name = "Heal";
    Skill_Heal.prototype.range = 0;
    Skill_Heal.prototype.auto = false;
    Skill_Heal.prototype.CT = 4;
    Skill_Heal.prototype.bg_charge = 0.5;
    Skill_Heal.prototype.fg_charge = 1;
    Skill_Heal.prototype.exec = function() {
      var target;
      target = this.actor;
      if (this.ct >= this.MAX_CT) {
        target.status.hp += 30;
        this.ct = 0;
        return Sys.prototype.debug("do healing");
      }
    };
    return Skill_Heal;
  })();
  Skill_ThrowBomb = (function() {
    __extends(Skill_ThrowBomb, Skill);
    Skill_ThrowBomb.prototype.name = "Throw Bomb";
    Skill_ThrowBomb.prototype.range = 120;
    Skill_ThrowBomb.prototype.auto = true;
    Skill_ThrowBomb.prototype.CT = 4;
    Skill_ThrowBomb.prototype.bg_charge = 0.5;
    Skill_ThrowBomb.prototype.fg_charge = 1;
    function Skill_ThrowBomb(lv) {
      this.lv = lv != null ? lv : 1;
      Skill_ThrowBomb.__super__.constructor.call(this, this.lv);
      this.range = 120;
      this.effect_range = 30;
    }
    Skill_ThrowBomb.prototype.exec = function(objs, mouse) {
      var t, targets, _i, _len;
      if (this.ct >= this.MAX_CT) {
        targets = mouse.find_obj(ObjectGroup.get_against(this.actor), objs, this.range);
        if (targets.size() > 0) {
          for (_i = 0, _len = targets.length; _i < _len; _i++) {
            t = targets[_i];
            t.status.hp -= 20;
          }
          return this.ct = 0;
        }
      }
    };
    return Skill_ThrowBomb;
  })();
  Animation = (function() {
    __extends(Animation, Sprite);
    function Animation(max) {
      Animation.__super__.constructor.call(this, 0, 0);
      this.cnt = 0;
      this.max_frame = max;
    }
    Animation.prototype.render = function(g, x, y) {};
    return Animation;
  })();
  (Anim = {}).prototype = {
    Slash: _ = (function() {
      __extends(_, Animation);
      function _(amount) {
        this.amount = amount;
        _.__super__.constructor.call(this, 60);
      }
      _.prototype.render = function(g, x, y) {
        var per, zangeki, _ref;
        if ((0 <= (_ref = this.cnt++) && _ref < this.max_frame)) {
          g.init(Color.i(30, 55, 55));
          zangeki = 8;
          if (this.cnt < zangeki) {
            per = this.cnt / zangeki;
            g.drawDiffPath(true, [[x - 5 + per * 10, y - 10 + per * 20], [-8, -8], [4, 0]]);
          }
          if (this.cnt < this.max_frame) {
            per = this.cnt / this.max_frame;
            g.init(Color.i(255, 55, 55), 1 - this.cnt / this.max_frame);
            g.strokeText("" + this.amount, x + 10, y + 20 * per);
          }
          return this;
        } else {
          return false;
        }
      };
      return _;
    })(),
    Burn: _ = (function() {
      __extends(_, Animation);
      function _(amount, size) {
        this.amount = amount;
        this.size = size != null ? size : 30;
        _.__super__.constructor.call(this, 60);
      }
      _.prototype.render = function(g, x, y) {
        var per, _ref;
        if ((0 <= (_ref = this.cnt++) && _ref < this.max_frame)) {
          if (this.cnt < this.max_frame / 2) {
            g.init(Color.i(230, 55, 55), 1 - this.cnt / this.max_frame);
            per = this.cnt / (this.max_frame / 2);
            g.drawArc(true, x, y, 30 * per);
          }
          if (this.amount && this.cnt < this.max_frame) {
            per = this.cnt / this.max_frame;
            g.init(Color.i(255, 55, 55), 1 - this.cnt / this.max_frame);
            g.strokeText("" + this.amount, x + 10, y + 20 * per);
          }
          return this;
        } else {
          return false;
        }
      };
      return _;
    })()
  };
  Scene = (function() {
    function Scene() {}
    Scene.prototype.enter = function() {
      return this.name;
    };
    Scene.prototype.render = function(g) {
      this.player.render(g);
      return g.fillText(this.name, 300, 200);
    };
    return Scene;
  })();
  OpeningScene = (function() {
    __extends(OpeningScene, Scene);
    OpeningScene.prototype.name = "Opening";
    function OpeningScene(core) {
      this.core = core;
    }
    OpeningScene.prototype.enter = function() {
      if (this.core.keys.space) {
        return "Field";
      }
      return this.name;
    };
    OpeningScene.prototype.render = function(g) {
      g.init();
      g.fillText("Opening", 300, 200);
      return g.fillText("Press Space", 300, 240);
    };
    return OpeningScene;
  })();
  FieldScene = (function() {
    __extends(FieldScene, Scene);
    FieldScene.prototype.name = "Field";
    FieldScene.prototype._camera = null;
    function FieldScene(core) {
      var player, start_point;
      this.core = core;
      this.map = new SampleMap(this, 32);
      start_point = this.map.get_rand_xy();
      player = new Player(this, start_point.x, start_point.y, ObjectGroup.Player);
      if (this.core != null) {
        this.core.player = player;
      }
      this.objs = [player];
      this.set_camera(player);
    }
    FieldScene.prototype.enter = function() {
      var near_obj, obj, _i, _len;
      near_obj = this.objs.filter(__bind(function(e) {
        return e.get_distance(this._camera) < 400;
      }, this));
      for (_i = 0, _len = near_obj.length; _i < _len; _i++) {
        obj = near_obj[_i];
        obj.update(this.objs, this.map, this._camera);
      }
      this.map.update(this.objs, this._camera);
      this.frame_count++;
      if (this.core.keys.c === 2) {
        return "Menu";
      }
      return this.name;
    };
    FieldScene.prototype.set_camera = function(obj) {
      return this._camera = obj;
    };
    FieldScene.prototype.render = function(g) {
      var obj, player, _i, _len, _ref;
      this.map.render(g, this._camera);
      _ref = this.objs.filter(__bind(function(e) {
        return e.get_distance(this._camera) < 400;
      }, this));
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        obj.render(g, this._camera);
      }
      this.map.render_after(g, this._camera);
      player = this._camera;
      if (player) {
        player.render_skill_gage(g);
        g.init();
        return g.fillText("HP " + player.status.hp + "/+" + player.status.MAX_HP + "\nlv." + player.status.lv + " " + player.status.exp + "/ " + player.status.next_lv, 15, 15);
      }
    };
    return FieldScene;
  })();
  MenuScene = (function() {
    __extends(MenuScene, Scene);
    MenuScene.prototype.name = "Menu";
    function MenuScene(core) {
      this.core = core;
    }
    MenuScene.prototype.enter = function() {
      if (this.core.keys.c === 2) {
        return "Field";
      }
      return this.name;
    };
    MenuScene.prototype.render = function(g) {
      var i, item, k, v, _i, _len, _ref, _ref2, _ref3, _results;
      g.init();
      g.initText();
      g.fillText("" + this.core.player.name + " STR:" + this.core.player.status.STR + " INT:" + this.core.player.status.INT + " DEX:" + this.core.player.status.DEX, 20, 20);
      i = 0;
      _ref = this.core.player._equips_;
      for (k in _ref) {
        v = _ref[k];
        g.fillText("" + k + ": " + ((v != null ? v.name : void 0) || 'none'), 30, 40 + (i++) * 15);
      }
      i = 0;
      _ref2 = this.core.player._items_;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        item = _ref2[_i];
        g.fillText("" + item.name, 300, 40 + (i++) * 15);
      }
      i = 0;
      _ref3 = this.core.player.skills;
      _results = [];
      for (k in _ref3) {
        v = _ref3[k];
        _results.push(g.fillText("" + v.name + ":lv" + ((v != null ? v.lv : void 0) || 'none'), 150, 40 + (i++) * 15));
      }
      return _results;
    };
    return MenuScene;
  })();
  String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
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
  if (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D !== null) {
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
  }
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
  vows = require('vows');
  assert = require('assert');
  keys = {
    left: 0,
    right: 0,
    up: 0,
    down: 0
  };
  mouse = {
    x: 320,
    y: 240
  };
  p = console.log;
  Elements = ["slash", "thrust", "blow", "fire", "flost", "thunder", "holy", "darkness"];
  vows.describe('Game Test').addBatch({
    Item: {
      topic: new ItemBox,
      'get item': function(t) {
        t.add_item(new Dagger);
        t.add_item(new Blade);
        return console.log(t.serialize());
      }
    },
    Equip: {
      topic: {
        player: new Player(null, 100, 100, ObjectGroup.Player),
        goblin: new Goblin(null, 100, 100, ObjectGroup.Enemy)
      },
      'Set Status': function(topic) {
        var g;
        p = topic.player;
        g = topic.goblin;
        p.equip(new Blade);
        p.equip(new SmallShield);
        p.equip(new ClothArmor);
        return g.equip(new Dagger);
      }
    },
    Combat: {
      topic: {
        player: new Player(null, 100, 100, ObjectGroup.Player),
        goblin: new Goblin(null, 100, 100, ObjectGroup.Enemy),
        map: new SampleMap()
      }
    }
  })["export"](module);
}).call(this);
