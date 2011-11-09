(function() {
  var AreaHit, Armor, Blade, Character, ClothArmor, Dagger, DamageHit, EquipItem, Game, GameData, Goblin, HealObject, Item, ItemBox, ItemObject, MoneyObject, Node, ObjectGroup, Player, RandomStage, Room, SingleHit, Skill, Skill_Atack, Skill_Heal, Skill_Meteor, Skill_Smash, Skill_ThrowBomb, SmallShield, Sprite, Stage, Status, Sys, TargetAreaHit, TresureObject, UseItem, Util, Weapon, Weapons, abs, blank, create_map, include, maps, max, min, pow, randint, random, sqrt;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  Game = (function() {
    function Game(conf) {
      Sys.prototype.message("Welcome to the world!");
      this.players = [];
      this.stage = new RandomStage(this, 32);
      this.objs = [];
      this.frame_count = 0;
    }
    Game.prototype.enter = function() {
      var obj, _i, _len, _ref;
      _ref = this.objs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        obj.update(this.objs, this.map);
      }
      this.stage.update(this.objs);
      return this.frame_count++;
    };
    Game.prototype.join_player = function(uname) {};
    Game.prototype.start = function() {
      return this.pid = setInterval(__bind(function() {
        return this.scene.enter();
      }, this), 1000 / 30);
    };
    Game.prototype.stop = function() {
      return clearInterval(this.pid);
    };
    return Game;
  })();
  maps = require('./maps');
  RandomStage = (function() {
    __extends(RandomStage, maps.Stage);
    function RandomStage(context, cell) {
      this.context = context;
      this.cell = cell != null ? cell : 32;
      RandomStage.__super__.constructor.call(this, this.cell);
      this._map = create_map(80, 50, 10);
      this.max_object_count = 18;
      this.frame_count = 0;
    }
    RandomStage.prototype.update = function(objs) {
      this.sweep(objs);
      return this.pop_monster(objs);
    };
    RandomStage.prototype.sweep = function(objs) {
      var i, _ref, _results;
      _results = [];
      for (i = 0, _ref = objs.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        if (objs[i].is_dead() && objs[i].cnt > 120) {
          objs.splice(i, 1);
          break;
        }
      }
      return _results;
    };
    RandomStage.prototype.pop_monster = function(objs) {
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
    return RandomStage;
  })();
  exports.Game = Game;
  Sprite = (function() {
    function Sprite(x, y, scale) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.scale = scale != null ? scale : 10;
    }
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
    ItemObject.prototype.update = function(objs, map) {
      return this.cnt++;
    };
    ItemObject.prototype.event = function(objs, map) {
      return console.log("you got item");
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
      return console.log("[Message] " + text);
    },
    debug: function(text) {
      return console.log(" -*- " + text);
    }
  };
  pow = Math.pow, sqrt = Math.sqrt, abs = Math.abs, random = Math.random, max = Math.max, min = Math.min;
  Room = (function() {
    function Room(map, depth, ax, ay) {
      var cx, cy;
      this.map = map;
      this.depth = depth;
      this.ax = ax;
      this.ay = ay;
      this.max_size = 4;
      this.next = null;
      if (this.depth > 0) {
        this.next = this.split();
      }
      if (this.ax[1] - this.ax[0] < 13) {
        this.rx = this.ax;
      } else {
        cx = ~~((this.ax[0] + this.ax[1]) / 2);
        this.rx = [cx - 6, cx + 6];
      }
      if (this.ay[1] - this.ay[0] < 13) {
        this.ry = this.ay;
      } else {
        cy = ~~((this.ay[0] + this.ay[1]) / 2);
        this.ry = [cy - 6, cy + 6];
      }
      this.center = [~~((this.rx[1] + this.rx[0]) / 2), ~~((this.ry[1] + this.ry[0]) / 2)];
      this.draw_area();
    }
    Room.prototype._v = function() {
      var cx, ex, sx, _ref;
      _ref = this.ax, sx = _ref[0], ex = _ref[1];
      cx = ~~((ex - sx) * (1 - random() / this.depth) + sx);
      this.ax = [cx, ex];
      return new Room(this.map, --this.depth, [sx, cx], this.ay);
    };
    Room.prototype._s = function() {
      var cy, ey, sy, _ref;
      _ref = this.ay, sy = _ref[0], ey = _ref[1];
      cy = ~~((ey - sy) * (1 - random() / this.depth) + sy);
      this.ay = [cy, ey];
      return new Room(this.map, --this.depth, this.ax, [sy, cy]);
    };
    Room.prototype.split = function() {
      if (Math.random() > 0.5) {
        return this._s();
      } else {
        return this._v();
      }
    };
    Room.prototype.draw_area = function() {
      var ex, ey, i, j, sx, sy, _ref, _ref2, _results;
      _ref = this.rx, sx = _ref[0], ex = _ref[1];
      _ref2 = this.ry, sy = _ref2[0], ey = _ref2[1];
      _results = [];
      for (i = sx; sx <= ex ? i < ex : i > ex; sx <= ex ? i++ : i--) {
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (j = sy; sy <= ey ? j < ey : j > ey; sy <= ey ? j++ : j--) {
            _results2.push((i === sx || i === (ex - 1)) || (j === sy || j === (ey - 1)) ? this.map[i][j] = 1 : this.map[i][j] = 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    Room.prototype.draw_path = function() {
      var cx, cy, nx, ny, _ref, _ref2;
      if (this.next) {
        _ref = this.center, cx = _ref[0], cy = _ref[1];
        _ref2 = this.next.center, nx = _ref2[0], ny = _ref2[1];
        while (abs(cx - nx) + abs(cy - ny) > 0) {
          if (cx > nx) {
            cx--;
          } else if (cx < nx) {
            cx++;
          } else if (cy > ny) {
            cy--;
          } else if (cy < ny) {
            cy++;
          }
          this.map[cx][cy] = 0;
        }
        return this.next.draw_path();
      }
    };
    return Room;
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
  Stage = (function() {
    __extends(Stage, Sprite);
    function Stage(cell) {
      this.cell = cell != null ? cell : 32;
      Stage.__super__.constructor.call(this, 0, 0, this.cell);
    }
    Stage.prototype.find = function(arr, pos) {
      var i, _i, _len;
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        i = arr[_i];
        if (i.pos[0] === pos[0] && i.pos[1] === pos[1]) {
          return i;
        }
      }
      return null;
    };
    Stage.prototype.load = function(text) {
      var i, map, row, tmap, y, _ref;
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
    Stage.prototype.gen_random_map = function(x, y) {
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
    Stage.prototype.get_point = function(x, y) {
      return {
        x: ~~((x + 1 / 2) * this.cell),
        y: ~~((y + 1 / 2) * this.cell)
      };
    };
    Stage.prototype.get_cell = function(x, y) {
      x = ~~(x / this.cell);
      y = ~~(y / this.cell);
      return {
        x: x,
        y: y
      };
    };
    Stage.prototype.get_rand_cell_xy = function() {
      var rx, ry;
      rx = ~~(Math.random() * this._map.length);
      ry = ~~(Math.random() * this._map[0].length);
      if (this._map[rx][ry]) {
        return this.get_rand_cell_xy();
      }
      return [rx, ry];
    };
    Stage.prototype.get_rand_xy = function() {
      var rx, ry;
      rx = ~~(Math.random() * this._map.length);
      ry = ~~(Math.random() * this._map[0].length);
      if (this._map[rx][ry]) {
        return this.get_rand_xy();
      }
      return this.get_point(rx, ry);
    };
    Stage.prototype.collide = function(x, y) {
      x = ~~(x / this.cell);
      y = ~~(y / this.cell);
      return this._map[x][y];
    };
    Stage.prototype.search_path = function(start, goal) {
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
    Stage.prototype._rotate90 = function(map) {
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
    Stage.prototype._set_wall = function(map) {
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
    return Stage;
  })();
  blank = function(x, y) {
    var i, j, map;
    map = [];
    for (i = 0; 0 <= x ? i < x : i > x; 0 <= x ? i++ : i--) {
      map[i] = [];
      for (j = 0; 0 <= y ? j < y : j > y; 0 <= y ? j++ : j--) {
        map[i][j] = 1;
      }
    }
    return map;
  };
  create_map = function(x, y, depth) {
    var root;
    root = new Room(blank(x, y), depth, [1, x - 1], [1, y - 1]);
    root.draw_path();
    return root.map;
  };
  randint = function(from, to) {
    if (!(to != null)) {
      to = from;
      from = 0;
    }
    return ~~(Math.random() * (to - from + 1)) + from;
  };
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
  Goblin = (function() {
    __extends(Goblin, Character);
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
      var last;
      if (this.status.hp < 10) {
        last = this.selected_skill;
        this.selected_skill = this.skills['two'];
        if (last === this.skills['one']) {
          return this.selected_skill.ct = 0;
        }
      } else {
        return this.selected_skill = this.skills['one'];
      }
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
    __extends(Player, Character);
    Player.prototype.scale = 8;
    Player.prototype.name = "Player";
    function Player(scene, x, y, group) {
      this.scene = scene;
      this.x = x;
      this.y = y;
      this.group = group != null ? group : ObjectGroup.Player;
      Player.__super__.constructor.call(this, this.x, this.y, this.group);
      this.keys = {};
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
      this.mouse = this.scene.core.mouse;
    }
    Player.prototype.getkey = function(which, to) {
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
    Player.prototype.change_skill = function() {
      return this.set_skill(this.scene.core.keys);
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
    EquipItem.prototype.a_magic = 0;
    EquipItem.prototype.a_thunder = 0;
    EquipItem.prototype.a_holy = 0;
    EquipItem.prototype.a_darkness = 0;
    EquipItem.prototype.r_slash = 0;
    EquipItem.prototype.r_thrust = 0;
    EquipItem.prototype.r_blow = 0;
    EquipItem.prototype.r_fire = 0;
    EquipItem.prototype.r_flost = 0;
    EquipItem.prototype.r_magic = 0;
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
      this.MAX_CT = this.CT * 30;
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
      return res = TargetAreaHit.__super__.exec.call(this, objs);
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
    Skill_Smash.prototype.range = 60;
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
  exports.Game = Game;
}).call(this);
