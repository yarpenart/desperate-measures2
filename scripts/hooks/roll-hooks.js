import { RollManager }
  from "../managers/RollManager.js";

export function registerRollHooks() {
  Hooks.on(
    "dnd5e.rollAbilityCheck",
    (rolls, data) => captureRoll(
      rolls,
      data,
      "abilityTest",
      data?.ability
    )
  );

  Hooks.on(
    "dnd5e.rollSavingThrow",
    (rolls, data) => captureRoll(
      rolls,
      data,
      "abilitySave",
      data?.ability
    )
  );

  Hooks.on(
    "dnd5e.rollSkill",
    (rolls, data) => captureRoll(
      rolls,
      data,
      "skill",
      data?.skill
    )
  );

  Hooks.on(
    "dnd5e.rollToolCheck",
    (rolls, data) => captureRoll(
      rolls,
      data,
      "toolCheck",
      data?.tool
    )
  );

  Hooks.on(
    "dnd5e.rollAttack",
    (rolls, data) => captureAttackRoll(
      rolls,
      data
    )
  );
}

async function captureRoll(
  rolls,
  data,
  type,
  identifier
) {
  const actor = data?.subject;

  const roll = Array.isArray(rolls)
    ? rolls[0]
    : rolls;

  if (!actor || typeof actor.setFlag !== "function") {
    console.warn(
      "Desperate Measures | Nie znaleziono aktora dla rzutu d20.",
      { rolls, data, type, identifier }
    );

    return null;
  }

  if (!roll) return null;

  return RollManager.storeRoll(
    actor,
    roll,
    type,
    identifier
  );
}

async function captureAttackRoll(rolls, data) {
  const activity = data?.subject;
  const actor = activity?.actor;

  const roll = Array.isArray(rolls)
    ? rolls[0]
    : rolls;

  if (!actor || typeof actor.setFlag !== "function") {
    console.warn(
      "Desperate Measures | Nie znaleziono aktora dla rzutu ataku.",
      { rolls, data }
    );

    return null;
  }

  if (!roll) return null;

  return RollManager.storeRoll(
    actor,
    roll,
    "attack",
    activity?.uuid ??
      activity?.id ??
      activity?.item?.id ??
      null
  );
}