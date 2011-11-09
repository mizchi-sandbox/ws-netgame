DATA =
  lv : 1
  exp : 0
  money: 100
  status :
    str: 10
    int: 10
    dex: 10

  skill:
    Atack: 3
    Smash: 1
    Heal: 1
    Meteor: 1

  equip:
    main_hand: 0
    sub_hand:null
    body:null

  equip_skill:
    one: "Atack"
    two: "Smash"
    three: "Heal"
    four: "Meteor"

  items :
    [
      {
        id:0
        name: "BloodSword"
        type: "Weapon"
        a_slash: 1.1
        effect :[
          name:"absorb"
          params:
            target : "HP"
            rate : 0.2
        ]
      }

      {   }
      {   }
    ]
