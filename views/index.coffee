# def func
bind = (text,obj={})->
  if typeof text is "object"
    obj["data-bind"] = (k+":"+v for k,v of text).join(',')
  else
    obj["data-bind"] = text
  obj

jqtpl = (tpname,fn)->
  div bind template:"'#{tpname}'",{class:"#{tpname}"}
  script id:tpname,type:"text/html",-> fn()

div class:"container-fluid",->
  jqtpl 'sidebar', ->
    ul id:"side-menu",->
      text "{{each(i,info) ObjectInfo}}"
      text "{{if info.o[2] > 1000 }}"
      li ->
        p -> "${info.s.n} lv.${info.s.lv}"
        p -> "HP:${info.s.hp}% "
      text "{{/if}}"
      text "{{/each}}"

  # div bind template:"'sidebar'",{class:"sidebar"}
  # script id:'sidebar',type:"text/html",->
  #   ul id:"side-menu",->
  #     text "{{each(i,info) ObjectInfo}}"
  #     li ->
  #       p -> "${v.name} lv.${v.lv}:  ${v.exp}%"
  #       p -> "HP:${v.hp}% : [${v.x},${v.y}]"
  #     text "{{/each}}"

  div class:"content",->
    div class :'span14',->
      h1 ->
        text "NetGame:"
        span id:'uid',-> String @id

      # div bind template:"'cooltime'",{class:"cooltime"}
      # script id:'cooltime',type:"text/html",->
      #   text "{{each(i,ct) CoolTime}}"
      #   span "[${ct.pos}]${ct.name}:${ct.rate}"
      #   text "{{/each}}"

      canvas id:"game",style:"float:left;background-color:gray;"


coffeescript ->
  canvas =  document.getElementById "game"
  canvas.width = 640
  canvas.height = 480
  $ =>
    soc.emit 'setname', name: $("span#uid").text()
    window.grr = new GameRenderer
    ko.applyBindings view
