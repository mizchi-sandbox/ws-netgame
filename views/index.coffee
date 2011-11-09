# def func
bind = (text,obj={})->
  if typeof text is "object"
    obj["data-bind"] = (k+":"+v for k,v of text).join(',')
  else
    obj["data-bind"] = text
  obj

# div class:"container-fluid",->
  # div class:"sidebar",->
  #   span "sidebar"

div class:"content",style:'height:550px;overflow:hidden;',->
  h1 "MyTestNetGame"
  canvas id:"game",style:"float:left;background-color:gray;"

coffeescript ->
  canvas =  document.getElementById "game"
  canvas.width = 640
  canvas.height = 480
