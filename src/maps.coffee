{pow,sqrt,abs,random,max,min} = Math
{Player, Goblin,ObjectGroup} = require('./char')
{Sprite,MoneyObject} = require('./sprites')

class Room
  constructor:(@map,@depth, @ax,@ay)->
    @max_size = 4
    @next = null
    if @depth > 0
      @next = @split()

    if @ax[1]-@ax[0] < 13
      @rx = @ax
    else
      cx = ~~((@ax[0]+@ax[1])/2)
      @rx = [cx-6, cx+6]
    if @ay[1]-@ay[0] < 13
      @ry = @ay
    else
      cy = ~~((@ay[0]+@ay[1])/2)
      @ry = [cy-6, cy+6]

    @center = [
      ~~((@rx[1]+@rx[0])/2)
      ~~((@ry[1]+@ry[0])/2)
    ]

    @draw_area()

  _v : ->
    [sx,ex] = @ax
    cx = ~~((ex-sx)*(1-random()/@depth)+sx)
    @ax = [cx,ex]
    new Room @map,--@depth, [sx,cx ],@ay

  _s : ->
    [sy , ey] = @ay
    cy = ~~( (ey-sy)*(1-random()/@depth)+sy  )
    @ay = [cy,ey]
    new Room @map,--@depth, @ax , [sy,cy]

  split:->
    if Math.random() > 0.5
      @_s()
    else
      @_v()

  draw_area : ->
    [sx,ex] = @rx
    [sy,ey] = @ry
    for i in [sx ... ex]
      for j in [sy ... ey]
        if (i == sx or i == (ex-1) ) or (j == sy or j == (ey-1))
          @map[i][j] = 1
        else
          @map[i][j] = 0

  draw_path : ->
    if @next
      [cx,cy] = @center
      [nx,ny] = @next.center
      while abs(cx-nx)+abs(cy-ny) > 0
        if cx>nx then cx--
        else if cx<nx then cx++
        else if cy>ny then cy--
        else if cy<ny then cy++
        @map[cx][cy] = 0
      @next.draw_path()

class Node
  start: [null,null]
  goal: [null,null]
  constructor:(pos)->
    @pos    = pos
    @owner_list  = null
    @parent = null
    @hs     = Math.pow(pos[0]-@goal[0],2)+Math.pow(pos[1]-@goal[1],2)
    @fs     = 0

  is_goal:(self)->
    return @goal == @pos


class Stage extends Sprite
  constructor: (@cell=32) ->
    super 0, 0, @cell
    @_map = blank(30,30) #@load(maps.debug)

  find:(arr,pos)->
    for i in arr
      if i.pos[0] == pos[0] and i.pos[1] == pos[1]
        return i
    return null

  load : (text)->
    tmap = text.replaceAll(".","0").replaceAll(" ","1").split("\n")
    max = Math.max.apply null,(row.length for row in tmap)
    map = []
    for y in [0...tmap.length]
      map[y]= ((if i < tmap[y].length then parseInt tmap[y][i] else 1) for i in [0 ... max])

    map = @_rotate90(map)
    map = @_set_wall(map)
    return map

  gen_random_map:(x,y)->
    map = []
    for i in [0 ... x]
      map[i] = []
      for j in [0 ... y]
        if (i == 0 or i == (x-1) ) or (j == 0 or j == (y-1))
          map[i][j] = 1
        else if Math.random() < 0.2
          map[i][j] = 1
        else
          map[i][j] = 0
    return map

  get_point: (x,y)->
    return {x:~~((x+1/2) *  @cell ),y:~~((y+1/2) * @cell) }

  get_cell: (x,y)->
    x = ~~(x / @cell)
    y = ~~(y / @cell)
    return {x:x,y:y}

  get_rand_cell_xy : ()->
    rx = ~~(Math.random()*@_map.length)
    ry = ~~(Math.random()*@_map[0].length)
    if @_map[rx][ry]
      return @get_rand_cell_xy()
    return [rx,ry]

  get_rand_xy: ()->
    rx = ~~(Math.random()*@_map.length)
    ry = ~~(Math.random()*@_map[0].length)
    if @_map[rx][ry]
      return @get_rand_xy()
    return @get_point(rx,ry)


  collide: (x,y)->
    x = ~~(x / @cell)
    y = ~~(y / @cell)
    return @_map[x][y]

  search_path: (start,goal)->
    path = []
    Node::start = start
    Node::goal = goal
    open_list = []
    close_list = []

    start_node = new Node(Node::start)
    start_node.fs = start_node.hs
    open_list.push(start_node)

    search_path =[
      [-1,-1], [ 0,-1], [ 1,-1]
      [-1, 0]         , [ 1, 0]
      [-1, 1], [ 0, 1], [ 1, 1]
    ]

    max_depth = 100
    for _ in [1..max_depth]
      return [] if open_list.size() < 1 #探索失敗

      open_list.sort( (a,b)->a.fs-b.fs )
      min_node = open_list[0]
      close_list.push( open_list.shift() )

      if min_node.pos[0] is min_node.goal[0] and min_node.pos[1] is min_node.goal[1]
        path = []
        n = min_node
        while n.parent
          path.push(n.pos)
          n = n.parent
        return path.reverse()

      n_gs = min_node.fs - min_node.hs

      for i in search_path # 8方向探索
        [nx,ny] = [i[0]+min_node.pos[0] , i[1]+min_node.pos[1]]
        if not @_map[nx][ny]
          dist = Math.pow(min_node.pos[0]-nx,2) + Math.pow(min_node.pos[1]-ny,2)

          if obj = @find(open_list,[nx,ny])
            if obj.fs > n_gs+obj.hs+dist
              obj.fs = n_gs+obj.hs+dist
              obj.parent = min_node
          else if obj = @find(close_list,[nx,ny])
            if obj.fs > n_gs+obj.hs+dist
                obj.fs = n_gs+obj.hs+dist
                obj.parent = min_node
                open_list.push(obj)
                close_list.remove(obj)
          else
            n = new Node([nx,ny])
            n.fs = n_gs+n.hs+dist
            n.parent = min_node
            open_list.push(n)
    return []

  _rotate90:(map)->
    res = []
    for i in [0...map[0].length]
      res[i] = ( j[i] for j in map)
    res

  _set_wall:(map)->
    x = map.length
    y = map[0].length
    map[0] = (1 for i in [0...map[0].length])
    map[map.length-1] = (1 for i in [0...map[0].length])
    for i in map
      i[0]=1
      i[i.length-1]=1
    map


blank = (x,y)->
  map = []
  for i in [0 ... x]
    map[i] = []
    for j in [0 ... y]
      map[i][j] = 1
  return map

create_map = (x,y,depth)->
  root = new Room(blank(x,y),depth ,[1,x-1],[1,y-1])
  root.draw_path()
  root.map

randint = (from,to) ->
  if not to?
    to = from
    from = 0
  return ~~( Math.random()*(to-from+1))+from


class RandomStage extends Stage
  constructor: (@context , @cell=32) ->
    super @cell
    @_map = create_map 30,30,10
    @max_object_count = 10      #
    @fcnt = 0
    @players = {}
    @objects = []

  # get_obj:->
  #   (for k,v of @players).concat(@objects)

  join : (id)->
    p = @players[id] = new Player(@,320,320) #id:id,keys:{}
    p.id = id

  leave : (id)->
    delete @players[id]

  update:()->
    obj.update(@objects, @) for obj in @objects
    v.update(@objects, @) for k,v of @players
    @sweep()
    @pop_monster()
    @fcnt++
    # console.log ([i.x,i.y] for k,i of @players ) if @fcnt%30 is 0

  sweep: ()->
    for i in [0 ... @objects.length]
      if @objects[i].is_dead() and @objects[i].cnt > 120
        @objects.splice(i,1)
        break

  pop_monster: () ->
    if @objects.length < @max_object_count and @fcnt % 60*3 == 0
      random_point  = @get_rand_xy()
      if random() < 0.9
        @objects.push( gob = new Goblin(random_point.x, random_point.y, ObjectGroup.Enemy) )
        console.log "pop monster:"


exports.RandomStage = RandomStage
