(function() {
  var Skill, Skill_Heal, Skill_Meteor, Skill_Smash, Skill_ThrowBomb;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Skill = (function() {
    function Skill(ct, lv) {
      if (ct == null) {
        ct = 1;
      }
      this.lv = lv != null ? lv : 1;
      this.MAX_CT = ct * 24;
      this.ct = this.MAX_CT;
    }
    Skill.prototype["do"] = function(actor) {};
    Skill.prototype.charge = function(actor) {
      if (this.ct < this.MAX_CT) {
        return this.ct += 1;
      }
    };
    return Skill;
  })();
  Skill_Heal = (function() {
    __extends(Skill_Heal, Skill);
    function Skill_Heal(lv) {
      this.lv = lv != null ? lv : 1;
      Skill_Heal.__super__.constructor.call(this, 15, this.lv);
      this.name = "Heal";
    }
    Skill_Heal.prototype["do"] = function(actor) {
      var target;
      target = actor;
      if (this.ct >= this.MAX_CT) {
        target.status.hp += 30;
        target.check_state();
        this.ct = 0;
        return console.log("do healing");
      } else {
        ;
      }
    };
    return Skill_Heal;
  })();
  Skill_Smash = (function() {
    __extends(Skill_Smash, Skill);
    function Skill_Smash(lv) {
      this.lv = lv != null ? lv : 1;
      Skill_Smash.__super__.constructor.call(this, 8, this.lv);
      this.name = "Smash";
    }
    Skill_Smash.prototype["do"] = function(actor) {
      var target;
      target = actor.targeting;
      if (target) {
        if (this.ct >= this.MAX_CT) {
          target.status.hp -= 30;
          target.check_state();
          this.ct = 0;
          return console.log("Smash!");
        }
      }
    };
    return Skill_Smash;
  })();
  Skill_Meteor = (function() {
    __extends(Skill_Meteor, Skill);
    function Skill_Meteor(lv) {
      this.lv = lv != null ? lv : 1;
      Skill_Meteor.__super__.constructor.call(this, 20, this.lv);
      this.name = "Meteor";
      this.range = 120;
    }
    Skill_Meteor.prototype["do"] = function(actor, targets) {
      var t, targets_on_focus, _i, _len;
      if (this.ct >= this.MAX_CT) {
        targets_on_focus = actor.get_targets_in_range(targets = targets, this.range);
        if (targets_on_focus.length) {
          console.log(targets_on_focus.length);
          for (_i = 0, _len = targets_on_focus.length; _i < _len; _i++) {
            t = targets_on_focus[_i];
            t.status.hp -= 20;
            t.check_state();
          }
          this.ct = 0;
          return console.log("Meteor!");
        }
      }
    };
    return Skill_Meteor;
  })();
  Skill_ThrowBomb = (function() {
    __extends(Skill_ThrowBomb, Skill);
    function Skill_ThrowBomb(lv) {
      var ct;
      this.lv = lv != null ? lv : 1;
      Skill_ThrowBomb.__super__.constructor.call(this, ct = 10, this.lv);
      this.name = "Throw Bomb";
      this.range = 120;
      this.effect_range = 30;
    }
    Skill_ThrowBomb.prototype["do"] = function(actor, targets, mouse) {
      var t, targets_on_focus, _i, _len;
      if (this.ct >= this.MAX_CT) {
        targets_on_focus = actor.get_targets_in_range(targets = targets, this.range);
        if (targets_on_focus.length) {
          console.log(targets_on_focus.length);
          for (_i = 0, _len = targets_on_focus.length; _i < _len; _i++) {
            t = targets_on_focus[_i];
            t.status.hp -= 20;
            t.check_state();
          }
          this.ct = 0;
          return console.log("Meteor!");
        }
      }
    };
    return Skill_ThrowBomb;
  })();
}).call(this);
