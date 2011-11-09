(function() {
  var Map, base_block, maps;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Map = (function() {
    __extends(Map, Sprite);
    function Map(cell) {
      var m;
      this.cell = cell != null ? cell : 32;
      Map.__super__.constructor.call(this, 0, 0, this.cell);
      m = this.load(maps.debug);
      this._map = m;
      this.rotate90();
      this.set_wall();
    }
    Map.prototype.load = function(text) {
      var i, list, map, max, row, tmap, y, _i, _j, _k, _len, _len2, _len3, _ref;
      tmap = text.replaceAll(".", "0").replaceAll(" ", "1").split("\n");
      map = [];
      max = 0;
      for (_i = 0, _len = tmap.length; _i < _len; _i++) {
        row = tmap[_i];
        if (max < row.length) {
          max = row.length;
        }
      }
      y = 0;
      for (_j = 0, _len2 = tmap.length; _j < _len2; _j++) {
        row = tmap[_j];
        list = [];
        _ref = row + 1;
        for (_k = 0, _len3 = _ref.length; _k < _len3; _k++) {
          i = _ref[_k];
          list[list.length] = parseInt(i);
        }
        while (list.length < max) {
          list.push(1);
        }
        map[y] = list;
        y++;
      }
      return map;
    };
    Map.prototype.compile = function(data) {
      return "";
    };
    Map.prototype.rotate90 = function() {
      var i, j, map, res, _ref;
      map = this._map;
      res = [];
      for (i = 0, _ref = map[0].length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
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
      return this._map = res;
    };
    Map.prototype.set_wall = function() {
      var i, map, x, y, _i, _len;
      map = this._map;
      x = map.length;
      y = map[0].length;
      map[0] = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = map[0].length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          _results.push(1);
        }
        return _results;
      })();
      map[map.length - 1] = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = map[0].length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
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
    Map.prototype.gen_random_map = function(x, y) {
      var i, j, map;
      map = [];
      for (i = 0; (0 <= x ? i < x : i > x); (0 <= x ? i += 1 : i -= 1)) {
        map[i] = [];
        for (j = 0; (0 <= y ? j < y : j > y); (0 <= y ? j += 1 : j -= 1)) {
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
    Map.prototype.get_randpoint = function() {
      var rx, ry;
      rx = ~~(Math.random() * this._map.length);
      ry = ~~(Math.random() * this._map[0].length);
      if (this._map[rx][ry]) {
        return this.get_randpoint();
      }
      return this.get_point(rx, ry);
    };
    Map.prototype.collide = function(x, y) {
      x = ~~(x / this.cell);
      y = ~~(y / this.cell);
      return this._map[x][y];
    };
    Map.prototype.render = function(g, cam) {
      var color, i, j, pos, w, x, y, _ref, _results;
      pos = this.getpos_relative(cam);
      _results = [];
      for (i = 0, _ref = this._map.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _results.push((function() {
          var _ref, _results;
          _results = [];
          for (j = 0, _ref = this._map[i].length; (0 <= _ref ? j < _ref : j > _ref); (0 <= _ref ? j += 1 : j -= 1)) {
            _results.push(this._map[i][j] ? (this.init_cv(g, color = "rgb(30,30,30)"), w = 8, x = pos.vx + i * this.cell, y = pos.vy + j * this.cell, g.moveTo(x, y + this.cell), g.lineTo(x + w, y + this.cell - w), g.lineTo(x + this.cell + w, y + this.cell - w), g.lineTo(x + this.cell, y + this.cell), g.lineTo(x, y + this.cell), g.fill(), this.init_cv(g, color = "rgb(40,40,40)"), g.moveTo(x, y + this.cell), g.lineTo(x, y), g.lineTo(x + w, y - w), g.lineTo(x + w, y - w + this.cell), g.lineTo(x, y + this.cell), g.fill()) : void 0);
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    Map.prototype.render_after = function(g, cam) {
      var alpha, color, i, j, pos, w, _ref, _results;
      pos = this.getpos_relative(cam);
      _results = [];
      for (i = 0, _ref = this._map.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _results.push((function() {
          var _ref, _results;
          _results = [];
          for (j = 0, _ref = this._map[i].length; (0 <= _ref ? j < _ref : j > _ref); (0 <= _ref ? j += 1 : j -= 1)) {
            _results.push(this._map[i][j] ? (my.init_cv(g, color = "rgb(50,50,50)", alpha = 1), w = 5, g.fillRect(pos.vx + i * this.cell + w, pos.vy + j * this.cell - w, this.cell, this.cell)) : void 0);
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    return Map;
  })();
  maps = {
    filed1: "\n                                           .........\n                                    ................... .\n                               ...........            ......\n                            ....                      ..........\n                         .....              .....        ...... .......\n                 ..........              .........        ............ .....\n                 ............          ...... . ....        ............ . ..\n             .....    ..    ...        ..  ..........       . ..................\n     ..     ......          .........................       . .......   ...... ..\n    .....    ...     ..        .......  ...............      ....        ........\n  ...... ......    .....         ..................... ..   ....         ........\n  .........   ......  ...............  ................... ....            ......\n ...........    ... ... .... .   ..   .. ........ ............             . .....\n ...........    ...... ...       ....................           ......\n............   .......... .    .......... ...... .. .       ...........\n .. ........ .......   ....   ...... .   ............      .... .......\n . ..............       .... .. .       ..............   ...... ..... ..\n  .............          .......       ......       ......... . ...... .\n  ..     .... ..         ... .       ....         .........   ...........\n ...       .......   ........       .. .        .... ....  ... ..........\n.. .         ......  .........      .............. ..  .....  ...    .....\n.....         ......................................      ....        ....\n .....       ........    ... ................... ....     ...        ....\n   ....   ........        ...........................  .....        .....\n   ...........  ..        ........ .............. ... .. .         .....\n       ......                 .........................           .. ..\n                                .....................          .......\n                                    ...................        ......\n                                        .............",
    debug: "             ....\n          ...........\n        ..............\n      .... ........... .\n     .......     ........\n.........    ..     ......\n........   ......    .......\n.........   .....    .......\n .................. ........\n     .......................\n     ....................\n           .............\n              ......\n               ...\n"
  };
  base_block = [[1, 1, 0, 1, 1], [1, 0, 0, 1, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 1, 0, 1, 1]];
}).call(this);
