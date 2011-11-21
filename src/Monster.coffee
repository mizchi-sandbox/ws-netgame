{random,sqrt,min,max,sin,cos} = Math

{Character} = require './char'
{Status} = require './Status'
{Equipment} = require './Equipment'
{SkillBox} = require './skills'

{RacialData} = require('./racialdata')
{ClassData} = require('./classdata')
{Weapons} = require('./equip')

#TODO : Equip Autogeneration

class Monster extends Character 
  constructor : (@class ,@race,equipment) ->
    @set_pos()
    @dir = 0
    # @id = ObjectId.Monster

    racial_status = RacialData[@race]
    class_data = ClassData[@class]
    sum = 0
    for i in ['str','int','dex']
      racial_status[i] += class_data.status[i]
      sum += racial_status[i]

    # 初期ステータスの比率に応じて成長率を設定
    for i in ['str','int','dex']
      racial_status[i] += ~~(@lv*racial_status[i]/sum/@per_rate)

    racial_status.lv = @lv
    @status = new Status racial_status
    super(@scene ,@x,@y,@group,@status)

    @skills = new SkillBox @,class_data.learned,class_data.preset
    @equipment = new Equipment equipment

    @selected_skill = @skills.sets.one

  die : (actor)->
    super actor
    @drop_item(actor) if actor

  drop_item : (actor)->

class Goblin extends Monster
  name : "Goblin"
  constructor: (@scene ,@lv, @group) ->
    @per_rate = 3 # 成長率 小さいほど強い プレーヤが 3
    @exp_rate = 1.0 # lvに応じた成長率

    super 'Norvice','goblin',
      main_hand : 
        name : 'dagger'
        drate : 0.7

    @status.trace_range = 13

  select_skill: ()->
    return @selected_skill = @skills.sets['one']
    # if @status.hp < 5
    #   last = @selected_skill
    #   @selected_skill = @skills.sets['one']
    # else
    #   @selected_skill = @skills.sets['two']

  # die : (actor)->
  #   super actor
    # actor.get_item new Weapons::Dagger
class HoundDog extends Monster
  name : "HoundDog"
  constructor: (@scene ,@lv, @group) ->
    @per_rate = 3 # 成長率 小さいほど強い プレーヤが 3
    @exp_rate = 1.0 # lvに応じた成長率

    super 'Norvice','hound_dog',{}

    @status.trace_range = 17

  select_skill: ()->
    return @selected_skill = @skills.sets['one']
    # if @status.hp < 5

exports.HoundDog = HoundDog
exports.Goblin = Goblin