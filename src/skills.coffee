class Skill
  constructor: (@actor,@lv=1) ->
    @_build(@lv)
    @MAX_CT = @CT * 30
    @ct = @MAX_CT

  charge:(is_selected)->
    if @ct < @MAX_CT
      if is_selected
        @ct += @fg_charge
      else
        @ct += @bg_charge
  update: (objs,keys)->
    for name,skill of @actor.skills
      skill.charge @, skill is @
    @exec objs

  exec:(objs)->
  _build:(lv)->
  _calc:(target)-> return 1
  _get_targets:(objs)-> return []

class DamageHit extends Skill
  range : 30
  auto: true
  CT : 1
  bg_charge : 0.2
  fg_charge : 1
  damage_rate : 1.0
  random_rate : 0.2
  effect : 'Slash'

  _calc_rate:(target,e)->
    @actor.get_param("a_#{e}") * (1-target.get_param("r_#{e}"))

  _get_random:()->
    randint(100*(1-@random_rate),100*(1+@random_rate))/100

  exec:(objs)->
    targets = @_get_targets(objs)
    if @ct >= @MAX_CT and targets.size() > 0
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
    if @actor.has_target()
      if @actor.get_distance(@actor.targeting_obj) < @range
        return [ @actor.targeting_obj ]
    return []

  _calc : (target)->
    damage = ~~(@actor.status.STR * @_calc_rate(target,'slash'))
    ~~(damage*@damage_rate*@_get_random())

class AreaHit extends DamageHit
  effect : 'Burn'
  _get_targets:(objs)->
    return @actor.find_obj ObjectGroup.get_against(@actor), objs , @range
  _calc : (target)->
    return ~~(@actor.status.atk * target.status.def*@damage_rate*randint(100*(1-@random_rate),100*(1+@random_rate))/100)

class TargetAreaHit extends DamageHit
  effect : 'Burn'
  _get_targets:(objs)->
    if @actor.has_target()
      if @actor.get_distance(@actor.targeting_obj) < @range
        return @actor.targeting_obj.find_obj ObjectGroup.get_against(@actor), objs , @range
    []
  _calc : (target)->
    return ~~(@actor.status.atk * target.status.def*@damage_rate*randint(100*(1-@random_rate),100*(1+@random_rate))/100)

  exec:(objs)->
    res = super objs
    # if res
    #   @actor.targeting_obj.add_animation new Anim.prototype[@effect] null, @range*1.5

class Skill_Atack extends SingleHit
  name : "Atack"
  range : 60
  CT : 1
  auto: true
  bg_charge : 0.2
  fg_charge : 1
  damage_rate : 1.0
  random_rate : 0.2

  _build:(lv)->
    @range -= lv
    @CT -= lv/40
    @bg_charge += lv/20
    @fg_charge -= lv/20
    @damage_rate += lv/20

class Skill_Smash extends SingleHit
  name : "Smash"
  range : 60
  CT : 2
  damage_rate : 2.2
  random_rate : 0.5
  bg_charge : 0.5
  fg_charge : 1

  _build: (lv) ->
    @range -= lv
    @CT -= lv/10
    @bg_charge += lv/20
    @fg_charge -= lv/20
    @damage_rate += lv/20
  _calc : (target)->
    return ~~(@actor.status.atk * target.status.def*@damage_rate*randint(100*(1-@random_rate),100*(1+@random_rate))/100)

class Skill_Meteor extends AreaHit
  name : "Meteor"
  range : 80
  auto: true
  CT : 4
  damage_rate : 5
  random_rate : 0.1

  bg_charge : 0.5
  fg_charge : 1
  effect : 'Burn'

  _calc : (target)->
    return ~~(@actor.status.atk * target.status.def*@damage_rate*randint(100*(1-@random_rate),100*(1+@random_rate))/100)

class Skill_Heal extends Skill
  name : "Heal"
  range : 0
  auto: false
  CT : 4
  bg_charge : 0.5
  fg_charge : 1

  exec:()->
    target = @actor
    if @ct >= @MAX_CT
      target.status.hp += 30
      @ct = 0
      Sys::debug "do healing"

class Skill_ThrowBomb extends Skill
  name : "Throw Bomb"
  range : 120
  auto: true
  CT : 4
  bg_charge : 0.5
  fg_charge : 1
  constructor: (@lv=1) ->
    super(@lv)
    @range = 120
    @effect_range = 30

  exec:(objs,mouse)->
    if @ct >= @MAX_CT
      targets = mouse.find_obj(ObjectGroup.get_against(@actor), objs ,@range)
      if targets.size()>0
        for t in targets
          t.status.hp -= 20
        @ct = 0

exports.Skill_Atack = Skill_Atack
exports.Skill_Heal = Skill_Heal
exports.Skill_Smash = Skill_Smash
exports.Skill_Meteor = Skill_Meteor

