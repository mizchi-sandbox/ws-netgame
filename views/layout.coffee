doctype 5
html ->
  head lang:'ja',->
    title 'Dir-Net'
    script(src: src) for src in [
      '/socket.io/socket.io.js'
      '/zappa/zappa.js'
      '/zappa/jquery.js'
      '/jquery.tmpl.js'
      '/knockout-1.3.0beta.js'
      '/easel.js'
      '/game.js'
      '/shared.js'
      '/bootstrap.js'
      '/index.js'

    ]
    (link rel:"stylesheet",type:"text/css",href:i) for i in [
      "/bootstrap.min.css"
    ]
  body @body

