const healMessage = "sleeps. The stress, lack of resources, and a proper bed limits healing. They only heal";

let macroActors = game.actors.filter(a => a.data.type == "character");
let classArray = [
    "Sorcerer", 
    "Monk", 
    "Warlock", 
    "Fighter", 
    "Bard", 
    "Ranger", 
    "Paladin", 
    "Barbarian", 
    "Cleric", 
    "Wizard", 
    "Rogue", 
    "Druid"
];
let plyrHealthList = [];

//populate list of player's current health
for (let macroActor of macroActors) {
    let { attributes } = macroActor.data.data;
    let currHealth = attributes.hp.value;

    var healthDict = {};
    healthDict["plyrName"] = macroActor.name;
    healthDict["currHP"] = currHealth
    plyrHealthList.push(healthDict);
}

//Apply long rest to everyone
function Main(){
    let macroActors = game.actors.filter(a => a.data.type == "character");
    for (let macroActor of macroActors) {  
        macroActor.longRest({dialog: false, chat: false, newDay: true});
    } 
}  
Main();

//heal players using adventuring phase rules
for (let macroActor of macroActors) {
    let macroClass = macroActor.items.find(i => classArray.includes(i.name));
    let plyrLvl = macroClass.data.data.levels;
    let plyrConMod = macroActor.data.data.abilities["con"].mod;
    let diceType = macroClass.data.data.hitDice;

    let oldHP = plyrHealthList.find(i => i["plyrName"] === macroActor.name)["currHP"];
    macroActor.update({"data.attributes.hp.value": parseInt(oldHP),});

    let diceAmntToHeal = 0;
    if (plyrLvl != 1) {
        diceAmntToHeal = Math.floor(plyrLvl / 2);
    }
    else {
        diceAmntToHeal = 1;
    }

    let healRoll = new Roll(`${diceAmntToHeal + diceType} + ${plyrConMod}`).roll();

    ChatMessage.create(
        {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: `<em>${macroActor.name} ${healMessage} <strong>${healRoll.total}</strong> <i>(${healRoll.formula} = ${healRoll.result})</i><em>`
        },
    {});

    updateHP(macroActor, healRoll.total);
}

/**
 * Updates the hp value of the actor sheet
 *
 * @param {Actor} actor active actor calling the macro
 * @param {Number} amt amount to add to current hp
 * @return {Number} actor sheet current hp value
 */
 function updateHP(actor, amt) {
    let { attributes } = actor.data.data;
    let cur_hp = attributes.hp.value;
    let max_hp = attributes.hp.max;
    let min_hp = attributes.hp.min;
  
    cur_hp = Math.min(cur_hp + amt, max_hp);
    cur_hp = Math.max(cur_hp, min_hp);
    actor.update({
      "data.attributes.hp.value": parseInt(cur_hp),
    });
    return cur_hp;
  }
