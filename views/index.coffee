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
    jqtpl 'cooltime', ->
      h3 'cooltime'
      $$ "{{each(i,ct) CoolTime}}"
      span "${i+1}:${ct}%/"
      $$ "{{/each}}"

    jqtpl 'object-status', ->
      ul id:"side-menu",->
        $$ "{{each(i,info) ObjectInfo}}"
        $$ "{{if info.o[2] > 1000 }}"
        li ->
          p -> "${info.s.n} lv.${info.s.lv} HP:${info.s.hp}%"
        $$ "{{/if}}"
        $$ "{{/each}}"

  div class:"span12",->
      h1 ->
        text "NetGame:"
        span id:'uid',-> String @id

      canvas id:"game",style:"float:left;background-color:gray;"


coffeescript ->
  canvas =  document.getElementById "game"
  canvas.width = 640
  canvas.height = 480
  $ =>
    $.get '/api/id' , (name)=>
      soc.emit 'setname', name:name
      window.grr = new GameRenderer
      ko.applyBindings view
