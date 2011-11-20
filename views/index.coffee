# def func
bind = (text,obj={})->
  if typeof text is "object"
    obj["data-bind"] = (k+":"+v for k,v of text).join(',')
  else
    obj["data-bind"] = text
  obj
$$ = text

jqtpl = (tpname,fn)->
  div bind template:"'#{tpname}'",{class:"#{tpname}"}
  script id:tpname,type:"text/html",-> fn()


div class:"container-fluid row",->
  div class:'span3',->
    jqtpl 'UserInfo', ->
      $$ "{{if CharInfo()}}"
      h4 -> "${CharInfo().name}"
      a href : '/logout',-> "Logout"
      p -> "${CharInfo().status.class} lv.${CharInfo().status.lv} [${CharInfo().status.race}]"
      $$ "{{/if}}"

    jqtpl 'StatusInfo', ->
      $$ "{{if CharInfo()}}"
      p -> "BP:${CharInfo().status.bp}p"
      dl -> 
        for i in ['str','int','dex']
          dt -> i
          dd -> 
            span -> "${CharInfo().status.#{i}} &nbsp;"

            $$ "{{if CharInfo().status.bp > 0}}"
            button bind(click:'use_battle_point',{target:i,class:"btn small"}), ->  "+"
            $$ "{{/if}}"
      $$ "{{/if}}"

    jqtpl 'skill-chart', ->
      $$ "{{if CharInfo()}}"
      p -> "SP:${CharInfo().status.sp}p"
      dl id:"skill-list",->
        $$ "{{each(sname,lv) CharInfo().skills.learned}}"
        dt ->  '${sname}'
        dd ->
          span "${lv} &nbsp;"
          $$ "{{if CharInfo().status.sp > 0}}"
          button bind(click:'use_skill_point',{target:'${sname}',class:"btn small"}), -> '+'
          $$ "{{/if}}"
        $$ "{{/each}}"
      $$ "{{/if}}"

    jqtpl 'object-status', ->
      ul id:"side-menu",->
        $$ "{{each(i,info) ObjectInfo}}"
        $$ "{{if info.o[2] > 1000 }}"
        li ->
          p -> "${info.s.n} lv.${info.s.lv} HP:${info.s.hp}%"
        $$ "{{/if}}"
        $$ "{{/each}}"


  div class:"span12",->
    jqtpl 'SkillInfo', ->
      $$ "{{if CharInfo()}}"
      div class:"row",->
        $$ "{{each(i,sk) CharInfo().skills.preset}}"
        div class:"span2",->
          $$ "${sk}"
          # $$ "${sk}:${CharInfo().skills.learned(sk)}"
        $$ "{{/each}}"
        # $$ "{{if sk.data}}"
      $$ "{{/if}}"
      
      div class:"row" , ->
        $$ "{{each(i,ct) CoolTime}}"
        div class:'span2' ,->
          p "[${i+1}] ${ct}%"
        $$ "{{/each}}"

    canvas id:"game",style:"float:left;background-color:black;"

    p "画面サイズ"
    button class:'btn',onclick:"grr.change_scale(grr.scale+1);",'scale++'
    button class:'btn',onclick:'grr.change_scale(grr.scale-1);','scale--'

coffeescript ->
  canvas =  document.getElementById "game"
  x = 20
  y = 15
  cell = 28
  canvas.width = x * cell
  canvas.height = y * cell
  $ =>
    $.get '/api/id' , (name)=>
      window.name = name
      window.floor = 0
      window.login name , floor
      window.grr = new GameRenderer x,y,cell
      ko.applyBindings view
