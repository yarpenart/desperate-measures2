import { RollManager }
  from "../managers/RollManager.js";

export function registerRollHooks() {
  Hooks.on(
    "dnd5e.rollAbilityTest",
    async (actor, roll, abilityId) => {
      await RollManager.storeRoll(
        actor,
        roll,
        "abilityTest",
        abilityId
      );
    }
  );

  Hooks.on(
    "dnd5e.rollAbilitySave",
    async (actor, roll, abilityId) => {
      await RollManager.storeRoll(
        actor,
        roll,
        "abilitySave",
        abilityId
      );
    }
  );

  Hooks.on(
    "dnd5e.rollSkill",
    async (actor, roll, skillId) => {
      await RollManager.storeRoll(
        actor,
        roll,
        "skill",
        skillId
      );
    }
  );

  Hooks.on(
    "dnd5e.rollToolCheck",
    async (item, roll) => {
      const actor = item?.actor;

      if (!actor) return;

      await RollManager.storeRoll(
        actor,
        roll,
        "toolCheck",
        item.id
      );
    }
  );
}