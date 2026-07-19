import {
  MODULE_NAME
} from "./constants/constants.js";

import {
  registerSettings
} from "./settings/settings.js";

import {
  registerAPI
} from "./api/api.js";

import {
  registerActorHooks
} from "./hooks/actor-hooks.js";

import {
  registerSheetHooks
} from "./hooks/sheet-hooks.js";

import {
  registerRestHooks
} from "./hooks/rest-hooks.js";

import {
  registerRollHooks
} from "./hooks/roll-hooks.js";

import {
  registerDamageHooks
} from "./hooks/damage-hooks.js";

import { BloodiedManager }
  from "./managers/BloodiedManager.js";

import { RulesJournal }
  from "./journal/RulesJournal.js";

console.log(
  `${MODULE_NAME} | Main module imported successfully`
);

Hooks.once("init", () => {
  console.log(
    `${MODULE_NAME} | Init started`
  );

  registerSettings();
  registerAPI();
  registerActorHooks();
  registerSheetHooks();
  registerRestHooks();
  registerRollHooks();
  registerDamageHooks();
  
  console.log(
    `${MODULE_NAME} | Init completed`
  );
});

Hooks.once("ready", async () => {
  console.log(
    `${MODULE_NAME} | Ready started`
  );

  for (const actor of game.actors) {
    if (actor.type !== "character") {
      continue;
    }

    await BloodiedManager.update(actor);
  }

  await RulesJournal.initialize();

  console.log(
    `${MODULE_NAME} | Ready completed`
  );
});
