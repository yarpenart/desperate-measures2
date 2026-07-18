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

import { BloodiedManager }
  from "./managers/BloodiedManager.js";

console.log(
  `${MODULE_NAME} | Module file loaded`
);

Hooks.once("init", () => {
  console.log(
    `${MODULE_NAME} | Initializing`
  );

  registerSettings();
  registerAPI();

  registerActorHooks();
  registerSheetHooks();
  registerRestHooks();
});

Hooks.once("ready", async () => {
  console.log(
    `${MODULE_NAME} | Ready`
  );

  for (const actor of game.actors) {
    if (actor.type !== "character") {
      continue;
    }

    await BloodiedManager.update(actor);
  }
});