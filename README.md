# WS-NetGame #

diabloっぽいネトゲつくろうとしたもの  
GoogleChrome/Firefox4.0以上等、WebSocket対応ブラウザに対応。  
スマホは確認してないけどキーボード必須。  


## How to play ##
---------
数字キー[1, 2, 3, 4]で技選択。
敵に近寄ると自動で発動
## oauthのトークンとパスをsessionの秘密鍵設定してconfig.coffee  
dasfda
d
![ss](https://github.com/mizchi/ws-netgame/raw/master/public/ss2.jpg "ss")
![ss](https://github.com/mizchi/ws-netgame/raw/master/public/ss.jpg "ss")

緑が自分。青が他のプレーヤー。赤がモンスター。

## Installing ##
$ git clone git://github.com/mizchi/ws-netgame.git  
$ cd ws-netgame  
$ npm install .
$ mv config-sample.coffee config.coffee
$ node server.js


## ChangeLog ##

僕が気が向いたものから順に実装されるので、

### v.0.0.6 
* 思い出しながらREADME書いてる
* underscore.js導入

### v.0.0.5
* クラスとレーシャルを実装(現状ステータスに補正がつくのみ)
* クラスごとにスキルを割り振り
* Monsterクラスでレーシャルとクラスのみでモンスター定義できるようにした
* Monsterクラスが初期化Lvに応じて強化されるようになった。

### v0.0.4
* Char定義クラスを分割
* Knockbackスキルを実装
* ChainLightningスキルを実装
* スキルポイントの割り振りを実装

### v0.0.3 
* エンジン側でビュースケールを除去して可変で表示できるように。
* 暫定UIを実装

### v0.0.2
* ログインを実装
* 拡張に備えてコードをリファクタリング
* nstore採用+Mongo/Redisの依存を排除

*v0.0.1*
* 公開

## TODO ##
上から順に気が向いたときに

* WebSocketのブロードキャストネームスペースをダンジョン階層ごとに分割
* スキルレベルに応じたスキル強化実装
* クライアント、D&Dでスキル付け替え
* コリジョンマップとオブジェクトマップの分割
* テストコードを書く
* マップ生成アルゴリズムの見直し
* サーバー側からクライアントへアニメーション伝達の仕組みを定義
* アイテムボックスを実装
* エゴアイテム生成アルゴリズムを実装
* プレーヤーネームのバリデーション

## Idea ##
やりたいこと
* Racialに応じたスキル
* ハイトの概念を導入
* スキルを色(属性)で分類してマスタリを簡易化
* 時間に応じてポーションを生成
* プレーヤーに陣営を設定して対立するように(WoW風)
* コンソールクライアントを用意 ref: https://github.com/mscdex/node-ncurses





