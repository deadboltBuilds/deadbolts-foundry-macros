const healMessage = "takes a moment to patch their wounds and heals";
let macroActor = actor;
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
let macroClass = macroActor.items.find(i => classArray.includes(i.name));
let plyrLvl = macroClass.data.data.levels;
let plyrConMod = macroActor.data.data.abilities["con"].mod;
let hitDiceUsed = macroClass.data.data.hitDiceUsed;
let diceType = macroClass.data.data.hitDice;

let numHitDice = 0;
new Dialog({
    title:'Example Dialog',
    content:`
        <form>
            <div class="form-group">
                <label># of Hit Dice to Use: </label>
                <input type='text' name='inputField'></input>
            </div>
        </form>`,
    buttons:{
        yes: {
            icon: "<i class='fas fa-check'></i>",
            label: `Apply Changes`
        }},
    default:'yes',
    close: html => {
        let result = html.find('input[name=\'inputField\']');
        if (result.val() !== '' && !isNaN(result.val()) && parseInt(result.val()) > 0) {
            if (parseInt(result.val()) <= (plyrLvl - hitDiceUsed)) {
                numHitDice = parseInt(result.val());
                let healRoll = new Roll(`${numHitDice + diceType} + ${numHitDice * plyrConMod}`).roll();
                macroClass.update({"data.hitDiceUsed": macroClass.data.data.hitDiceUsed + numHitDice});

                ChatMessage.create(
                    {
                        user: game.user._id,
                        speaker: ChatMessage.getSpeaker(),
                        content: `<em>${macroActor.name} ${healMessage} <strong>${healRoll.total}</strong> <i>(${healRoll.formula} = ${healRoll.result})</i><em>`
                    },
                {});

                updateHP(macroActor, healRoll.total);
            }
            else {
                new Dialog({
                    title: 'Oops!',
                    content: '<p>You don\'t have that many Hit Dice left!</p>',
                    buttons: {
                        ok: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Aw!"
                        }
                    },
                    default: "ok"
                }).render(true);
            }
        }
        else {
            new Dialog({
                title: 'Error!',
                content: '<p>Invalid input. Input must be a positive number.</p>',
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "OK"
                    }
                },
                default: "ok"
            }).render(true);
        }
    }
}).render(true);

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
