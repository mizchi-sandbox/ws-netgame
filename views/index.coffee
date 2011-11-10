# def func
bind = (text,obj={})->
  if typeof text is "object"
    obj["data-bind"] = (k+":"+v for k,v of text).join(',')
  else
    obj["data-bind"] = text
  obj

div class:"container-fluid",->
  div bind template:"'sidebar'",{class:"sidebar"}
  script id:'sidebar',type:"text/html",->
    ul id:"side-menu",->
      text "{{each(i,v) ObjectInfo}}"
      text "{{if v.id > 1000}}"
      li ->
        p -> "${v.name} lv.${v.lv}:  ${v.exp}%"
        p -> "HP:${v.hp}% : [${v.x},${v.y}]"
      text "{{/if}}"
      text "{{/each}}"

  div class:"content",->
    div class :'span14',->
      h1 ->
        text "NetGame:"
        span id:'uid',-> String @id
      canvas id:"game",style:"float:left;background-color:gray;"

coffeescript ->
  canvas =  document.getElementById "game"
  canvas.width = 640
  canvas.height = 480
  $ =>
    soc.emit 'setname', name: $("span#uid").text()
    window.grr = new GameRenderer
    ko.applyBindings view
