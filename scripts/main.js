import { BloodiedManager } 
from "./managers/BloodiedManager.js";


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