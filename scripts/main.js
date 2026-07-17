import { BloodiedManager } 
from "./managers/BloodiedManager.js";

import { DesperateManager }
from "./managers/DesperateManager.js";

import { DesperateButton }
from "./ui/DesperateButton.js";

console.log(
    "Desperate Measures | Module Loaded"
);



Hooks.once("init", () => {

    console.log(
        "Desperate Measures | Initializing"
    );

});



Hooks.on(
    "updateActor",
    async (actor, changes) => {


        if (
            changes.system?.attributes?.hp
        ) {

            await BloodiedManager.update(actor);

            console.log(
                "Desperate Measures | Bloodied Updated",
                actor.name
            );

        }

    }

);
Hooks.once(
"ready",
()=>{


game.commands.register(
"desperate-test",
{

name:"Add Desperate Failure",

callback: async ()=>{


const actor =
game.user.character;


if(!actor)
{
ui.notifications.warn(
"No character selected"
);

return;
}


const value =
await DesperateManager.addFailures(
actor,
1
);


ui.notifications.info(
`Desperate Failures: ${value}/3`
);


}


});


});

Hooks.on(
"renderActorSheet",
(app, html)=>{

    DesperateButton.createButton(
        app,
        html
    );

});