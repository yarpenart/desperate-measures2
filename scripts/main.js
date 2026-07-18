import { BloodiedManager }
  from "./managers/BloodiedManager.js";

import { DesperateManager }
  from "./managers/DesperateManager.js";

import { DesperateButton }
  from "./ui/DesperateButton.js";

  import { SpellSlotManager }
  from "./managers/SpellSlotManager.js";

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
      DesperateManager.reset(actor),

    use: (actor, measureId) =>
      DesperateManager.useMeasure(
        actor,
        measureId
      ),

    getPendingEffects: (actor) =>
      DesperateManager.getPendingEffects(actor),

    removePendingEffect: (actor, effectId) =>
  DesperateManager.removePendingEffect(
    actor,
    effectId
  ),

recoverSpellSlot: (actor, level) =>
  SpellSlotManager.recoverSlot(
    actor,
    level
  ),

getRecoverableSpellSlots: (actor) =>
  SpellSlotManager
    .getAvailableSlots(actor)
    .filter((slot) => slot.canRecover)
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
      
      const desperateFlagsChanged =
  foundry.utils.hasProperty(
    changes,
    "flags.desperate-measures"
  );

    if (
  hpChanged ||
  deathFailuresChanged ||
  desperateFlagsChanged
) {

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