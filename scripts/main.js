import { BloodiedManager }
  from "./managers/BloodiedManager.js";

import { DesperateManager }
  from "./managers/DesperateManager.js";

import { DesperateButton }
  from "./ui/DesperateButton.js";

const MODULE_ID = "desperate-measures";

console.log(
  "Desperate Measures | Module file loaded"
);

Hooks.once("init", () => {
  console.log(
    "Desperate Measures | Initializing"
  );

  game.desperateMeasures = {
    isBloodied: (actor) =>
      BloodiedManager.isBloodied(actor),

    getFailures: (actor) =>
      DesperateManager.getFailures(actor),

    addFailures: (actor, amount) =>
      DesperateManager.addFailures(actor, amount),

    resetFailures: (actor) =>
      DesperateManager.reset(actor)
  };
});

Hooks.once("ready", async () => {
  console.log(
    "Desperate Measures | Ready"
  );

  for (const actor of game.actors) {
    if (actor.type !== "character") continue;

    await BloodiedManager.update(actor);
  }
});

Hooks.on(
  "updateActor",
  async (actor, changes) => {
    const hpChanged =
      foundry.utils.hasProperty(
        changes,
        "system.attributes.hp.value"
      ) ||
      foundry.utils.hasProperty(
        changes,
        "system.attributes.hp.max"
      );

    if (hpChanged) {
      await BloodiedManager.update(actor);
    }

    const deathFailuresChanged =
      foundry.utils.hasProperty(
        changes,
        "system.attributes.death.failure"
      );

    if (hpChanged || deathFailuresChanged) {
      for (const sheet of Object.values(actor.apps ?? {})) {
        sheet.render(false);
      }
    }
  }
);

function renderDesperatePanel(app, html) {
  try {
    DesperateButton.createButton(app, html);
  } catch (error) {
    console.error(
      `${MODULE_ID} | Nie udało się dodać panelu do karty aktora.`,
      error
    );
  }
}

Hooks.on(
  "renderActorSheetV2",
  renderDesperatePanel
);

Hooks.on(
  "renderActorSheet",
  renderDesperatePanel
);