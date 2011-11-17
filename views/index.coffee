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
      p -> "bp:${CharInfo().status.bp} sp:${CharInfo().status.sp}"


      dl ->
        dt -> "STR" 
        dd -> "${CharInfo().status.str}"

        dt -> "INT"
        dd ->"${CharInfo().status.int}"

        dt -> "DEX"
        dd -> "${CharInfo().status.dex}"

      $$ "{{/if}}"

    p -> "BP消費で成長"
    button bind(click:'use_battle_point',{target:'str',class:"btn small"}), -> ' str++'
    $$ '&nbsp;'
    button bind(click:'use_battle_point',{target:'int',class:'btn small'}) , -> ' int++'
    $$ '&nbsp;'
    button bind(click:'use_battle_point',{target:'dex',class:'btn small'}) , -> ' dex++'


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


        # div class:'span1' ,->
        #   # p "[${i+1}] ${sk.data.name}.${sk.data.lv}"
        #   p "CT:${CoolTime()[i]}%"
        # # $$ "{{/if}}"
        # $$ "{{/each}}"
        #   # dd -> "${sk.data.name}:lv${sk.data.lv}"

    canvas id:"game",style:"float:left;background-color:black;"

    p "画面サイズ"
    button class:'btn',onclick:"grr.change_scale(grr.scale+1);",'sclae++'
    button class:'btn',onclick:'grr.change_scale(grr.scale-1);','scale--'
        # $$ "{{if CharInfo()}}"
        # dl ->
        #   $$ "{{each(i,sk) CharInfo().skills}}"
        #   $$ "{{if sk.data}}"
        #   dt -> "[key${i+1}]"+"${CoolTime()[i]}"
        #   dd -> "${sk.data.name}:lv${sk.data.lv}"
        #   $$ "{{/if}}"
        #   $$ "{{/each}}"
        # $$ "{{/if}}"

coffeescript ->
  canvas =  document.getElementById "game"
  x = 20
  y = 15
  cell = 28
  canvas.width = x * cell
  canvas.height = y * cell
  $ =>
    $.get '/api/id' , (name)=>
      soc.emit 'login', name:name
      window.grr = new GameRenderer x,y,cell
      ko.applyBindings view
