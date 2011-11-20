vows = require 'vows'
assert = require 'assert'
# nstore = require('nstore')
{ Stage }  = require './src/stage'

vows.describe('GameTest').addBatch
  StageGenerator:
    topic: new Stage
    init_and_kill:(stage)->
      map = stage.create_map 45,90,7
      console.log map
      for i in map
        console.log i.join('').split('0') .join(' ').split(1).join('/')
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


