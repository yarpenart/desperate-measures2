import { BloodiedManager }
  from "../managers/BloodiedManager.js";

export function registerActorHooks() {
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

      if (hpChanged) {
        await BloodiedManager.update(actor);
      }

      if (
        hpChanged ||
        deathFailuresChanged ||
        desperateFlagsChanged
      ) {
        renderActorApplications(actor);
      }
    }
  );

  Hooks.on(
    "updateCombat",
    async () => {
      if (!game.actors) return;

      for (const actor of game.actors) {
        if (actor.type !== "character") {
          continue;
        }

        await BloodiedManager.update(actor);
        renderActorApplications(actor);
      }
    }
  );
}

function renderActorApplications(actor) {
  for (
    const application of
    Object.values(actor.apps ?? {})
  ) {
    application.render(false);
  }
}