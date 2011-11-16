WS-NetGame
===============

diabloっぽいネトゲつくろうとしたもの
GoogleChrome/Firefox4.0以上等、WebSocket対応ブラウザに対応。スマホは確認してないけどキーボード必須。


遊び方
---------
数字キー[1, 2, 3, 4]で技選択。
敵に近寄ると自動で発動

![ss](https://github.com/mizchi/ws-netgame/raw/master/public/ss2.jpg "ss")
![ss](https://github.com/mizchi/ws-netgame/raw/master/public/ss.jpg "ss")


緑が自分。青が他のプレーヤー。赤がモンスター。

実行
---------

$ npm install zappa nstore  
$ mv config-sample.coffee config.coffee  
$ coffee app.coffee  
$ open http://localhost:4444  


