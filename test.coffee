vows = require 'vows'
assert = require 'assert'

vows.describe('GameTest').addBatch
  GameCore:
    topic:
      Game:require("./src/core").Game
    init_and_kill:(t)->
      game = new t.Game()
      game.start()
      game.stop()
      assert.isTrue( !!game.pid )
  # Map:
  # Equip:
  #   topic:
  #     player : new Player null,100,100,ObjectGroup.Player
  #     goblin:new Goblin null,100,100,ObjectGroup.Enemy
  #   'Set Status':(topic)->
  #     p = topic.player
  #     g = topic.goblin
  #     p.equip new Blade
  #     p.equip new SmallShield
  #     p.equip new ClothArmor
  #     g.equip new Dagger

.export module


Game=require("./src/core").Game
game = new Game()
game.start()
# game.stop()
# assert.isTrue( !!game.pid )
