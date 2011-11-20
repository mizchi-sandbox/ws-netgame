{pow,sqrt,abs,random,max,min} = Math
{Player, Goblin} = require('./char')
{ObjectId} = require('./ObjectId')
{Sprite,MoneyObject} = require('./sprites')
# require './Util'

class Room
  constructor:(@map,@depth, @ax,@ay)->
    @max_size = 4
    @next = null
    if @depth > 0
      @next = @split()

    # @rx = @ax
    # @ry = @ay
    max_size = 21
    r = ~~(max_size/2)
    if @ax[1]-@ax[0] < max_size
      @rx = @ax
    else
      cx = ~~((@ax[0]+@ax[1])/2)
      @rx = [cx-r, cx+r]
    if @ay[1]-@ay[0] < 13
      @ry = @ay
    else
      cy = ~~((@ay[0]+@ay[1])/2)
      @ry = [cy-r, cy+r]

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

class StageLoader 
  constructor: () ->
    super 0, 0
    @_map = @blank(30,30) #@load(maps.debug)
    @_map = new Room(10,10)


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

  load : (text)->
    tmap = text.replaceAll(".","0").replaceAll(" ","1").split("\n")
    max = Math.max.apply null,(row.length for row in tmap)
    map = []
    for y in [0...tmap.length]
      map[y]= ((if i < tmap[y].length then parseInt tmap[y][i] else 1) for i in [0 ... max])

    map = @_rotate90(map)
    map = @_set_wall(map)
    return map


class Stage extends Sprite
  constructor: () ->
    super 0, 0
    @_map = @blank(30,30) #@load(maps.debug)


  get_point: (x,y)->
    return [~~(x)+1/2,~~(y)+1/2]

  get_random_point: ()->
    rx = ~~(Math.random()*@_map.length)
    ry = ~~(Math.random()*@_map[0].length)
    if @_map[rx][ry]
      return @get_random_point()
    return [rx+1/2,ry+1/2]

  collide: (x,y)->
    return @_map[~~(x)][~~(y)]


  blank : (x,y)->
    map = []
    for i in [0 ... x]
      map[i] = []
      for j in [0 ... y]
        map[i][j] = 1
    return map

  create_map : (x,y,depth)->
    root = new Room(@blank(x,y),depth ,[1,x-1],[1,y-1])
    root.draw_path()
    root.map


  find:(arr,pos)->
    for i in arr
      if i.pos[0] == pos[0] and i.pos[1] == pos[1]
        return i
    return null

  search_path: (start,goal,depth=50)->
    class Node
      start: start
      goal: goal
      constructor:(@pos)->
        @owner_list  = null
        @parent = null
        @hs     = pow(pos[0]-@goal[0],2)+pow(pos[1]-@goal[1],2)
        @fs     = 0

    search_path =[
      [-1,-1], [ 0,-1], [ 1,-1]
      [-1, 0]         , [ 1, 0]
      [-1, 1], [ 0, 1], [ 1, 1]
    ]

    path = []
    open_list = []
    close_list = []
    start_node = new Node(Node::start)
    start_node.fs = start_node.hs
    open_list.push(start_node)


    for _ in [1..depth]
      return [] if open_list.length < 1 #探索失敗

      # ゴールまでの直線距離順にソート
      open_list.sort (a,b)->a.fs-b.fs
      min_node = open_list[0] # 最小ノードを選択
      close_list.push open_list.shift()
      [ mx ,my ] = min_node.pos

      # 到着
      if mx is min_node.goal[0] and my is min_node.goal[1]
        path = []
        n = min_node
        # 親を辿る
        path.push(n.pos) while n = n.parent
        return path.reverse()

      n_gs = min_node.fs - min_node.hs

      for [x,y] in search_path
        # 斜めの判定が可能か
        if abs(x)+abs(y) > 1
          unless !@_map[x+mx][my] and !@_map[mx][y+my]
            continue

        [nx,ny] = [x+mx,y+my]
        unless @_map[nx][ny]
          dist = pow(mx-nx,2) + pow(my-ny,2)

          if obj = @find(open_list,[nx,ny])
            if obj.fs > n_gs+obj.hs+dist
              obj.fs = n_gs+obj.hs+dist
              obj.parent = min_node
          else if obj = @find(close_list,[nx,ny])
            if obj.fs > n_gs+obj.hs+dist
                obj.fs = n_gs+obj.hs+dist
                obj.parent = min_node
                open_list.push(obj)
                # close_list.remove(obj)
                close_list.splice( close_list.indexOf(obj) , 1)
          else
            n = new Node([nx,ny])
            n.fs = n_gs+n.hs+dist
            n.parent = min_node
            open_list.push(n)
    return []

exports.Stage = Stage

