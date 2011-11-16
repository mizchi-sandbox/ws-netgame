{ObjectId} = require './ObjectId'
{randint} = require './Util'
{random} = Math
seq = ['one','two','three','four','five','six','seven','eight','nine','zero']

class Skill
  constructor: (@actor,@lv=1) ->
    @CT *= 15
    @ct = 0

  charge:(is_selected)->
    if @ct < @CT
      if is_selected
        @ct += @fg_charge
      else
        @ct += @bg_charge

  update: (objs,keys)->
    # for name,skill of @actor.skills
    #   skill.charge skill is @
    @exec objs

  toData : ->
    name: @name
    lv: @lv

  exec:(objs)->
  _calc:(target)-> return 1
  _get_targets:(objs)-> return []

class DamageHit extends Skill
  range : 30
  auto: true
  BCT : 1
  bg_charge : 0.2
  fg_charge : 1
  damage_rate : 1.0
  random_rate : 0.2
  effect : 'Slash'

  _calc_rate:(target,e)->
    1
    # @actor.get_param("a_#{e}") * (1-target.get_param("r_#{e}"))

  _get_random:()->
    randint(100*(1-@random_rate),100*(1+@random_rate))/100

  exec:(objs)->
    targets = @_get_targets(objs)
    # console.log @actor.name+":"+@name+":"+@ct/@MAX_CT
    if @ct >= @CT and targets.length > 0
      for t in targets
        amount = @_calc t
        t.add_damage(@actor,amount)
        # t.add_animation new Anim.prototype[@effect] amount
      @ct = 0
      return true
    return false

class SingleHit extends DamageHit
  effect : 'Slash'
  _get_targets:(objs)->
    if @actor.target
      if @actor.get_distance(@actor.target) < @range
        return [ @actor.target ]
    return []

  _calc : (target)->
    damage = ~~(@actor.status.str * @_calc_rate(target,'slash'))
    ~~(damage*@damage_rate*@_get_random())

class ChainHit extends DamageHit
  effect : 'Slash'
  _get_targets:(objs)->
    depth = 1
    add = 1
    if @actor.target
      tar = []
      if @actor.get_distance(@actor.target) < @range
        tar.push (e = @actor.target )
        nobjs = e.find_obj(e.group,objs,@range/2)
        nobjs.remove e
        if nobjs.length is 0 
          return tar
        if nobjs.length > 0  
          tar.push nobjs[ ~~(nobjs.length*Math.random()) ]
          return tar
    return []

  _calc : (target)->
    damage = ~~(@actor.status.str * @_calc_rate(target,'slash'))
    ~~(damage*@damage_rate*@_get_random())

class AreaHit extends DamageHit
  effect : 'Burn'
  _get_targets:(objs)->
    return @actor.find_obj ObjectId.get_enemy(@actor), objs , @range
  _calc : (target)->
    return ~~(@actor.status.atk * target.status.def*@damage_rate*randint(100*(1-@random_rate),100*(1+@random_rate))/100)

class TargetAreaHit extends DamageHit
  effect : 'Burn'
  _get_targets:(objs)->
    if @actor.target
      if @actor.get_distance(@actor.targeting_obj) < @range
        return @actor.targeting_obj.find_obj ObjectId.get_enemy(@actor), objs , @range
    []
  _calc : (target)->
    return ~~(@actor.status.atk * target.status.def*@damage_rate*randint(100*(1-@random_rate),100*(1+@random_rate))/100)

  exec:(objs)->
    res = super objs
    # if res
    #   @actor.targeting_obj.add_animation new Anim.prototype[@effect] null, @range*1.5

class Atack extends SingleHit
  constructor: () ->
    @CT = 1
    super arguments[0],arguments[1]
    @name = "Atack"
    @range = 60
    @auto =  true
    @bg_charge = 0
    @fg_charge = 1
    @damage_rate = 1.0
    @random_rate = 0.2

  _calc : (target)->
    damage = ~~(@actor.status.str * @_calc_rate(target,'slash'))
    ~~(damage*@damage_rate*@_get_random())


class Lightning extends ChainHit
  constructor: () ->
    @CT = 2
    super arguments[0],arguments[1]
    @name = "Lightning"
    @range = 220
    @auto =  true
    @bg_charge = 0.1
    @fg_charge = 1
    @damage_rate = 1.0
    @random_rate = 0.2

  _calc : (target)->
    damage = ~~(@actor.status.int * @_calc_rate(target,'slash'))
    ~~(damage*@damage_rate*@_get_random())


class Smash extends SingleHit
  constructor: ->
    @CT = 2
    super arguments[0],arguments[1]
    @name = "Smash"
    @range = 60
    @damage_rate = 2.2
    @random_rate = 0.5
    @bg_charge = 0.5
    @fg_charge = 1


  _calc : (target)->
    return ~~(@actor.status.atk * target.status.def*@damage_rate*randint(100*(1-@random_rate),100*(1+@random_rate))/100)

class Meteor extends AreaHit
  constructor: () ->
    @CT = 4
    super arguments[0],arguments[1]
    @name = "Meteor"
    @range = 80
    @auto = true
    @damage_rate = 5
    @random_rate = 0.1

    @bg_charge = 0.5
    @fg_charge = 1
    @effect = 'Burn'

  _calc : (target)->
    return ~~(@actor.status.atk * target.status.def*@damage_rate*randint(100*(1-@random_rate),100*(1+@random_rate))/100)

class Heal extends Skill
  constructor: () ->
    @CT = 3
    super arguments[0],arguments[1]
    @name = "Heal"
    @range = 0
    @auto= false
    @bg_charge = 0.5
    @fg_charge =  1

  exec:()->
    target = @actor
    if @ct >= @CT
      target.status.hp += 30
      @ct = 0
      console.log "do healing"

class ThrowBomb extends Skill
  name : "Throw Bomb"
  range : 120
  auto: true
  BCT : 4
  bg_charge : 0.5
  fg_charge : 1
  constructor: (@lv=1) ->
    super(@lv)
    @range = 120
    @effect_range = 30

  exec:(objs,mouse)->
    if @ct >= @CT
      targets = mouse.find_obj(ObjectId.get_enemy(@actor), objs ,@range)
      if targets.size()>0
        for t in targets
          t.status.hp -= 20
        @ct = 0

exports.Atack = Atack
exports.Heal = Heal
exports.Smash = Smash
exports.Meteor = Meteor
exports.Lightning = Lightning

class SkillBox
  constructor:(actor , data={})->
    @data = data
    for i in data
      if i.data 
        @[i.key] = new exports[i.data.name](actor, i.data.lv)

  toData:->
    ((key:i,data:@[i]?.toData()) for i in seq)

exports.SkillBox = SkillBox
