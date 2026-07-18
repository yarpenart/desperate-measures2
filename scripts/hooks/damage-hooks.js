import {
  MODULE_ID,
  FLAGS,
  MEASURE_IDS
} from "../constants/constants.js";

export function registerDamageHooks() {
  Hooks.on(
    "dnd5e.rollAttack",
    (rolls, data) => {
      const actor = data?.subject?.actor;

      if (!actor) return;

      clearMaximizeDamageEffects(actor).catch(
        (error) => console.error(
          "Desperate Measures | Nie udalo sie wyczyscic efektu maksymalnych obrazen.",
          error
        )
      );
    }
  );

  Hooks.on(
    "dnd5e.postDamageRollConfiguration",
    (rolls, config, dialog, message) =>
      maximizePendingDamage(
        rolls,
        config,
        message
      )
  );
}

function getPendingEffects(actor) {
  const effects = actor?.getFlag(
    MODULE_ID,
    FLAGS.PENDING_EFFECTS
  );

  return Array.isArray(effects) ? effects : [];
}

function getActiveMaximizeEffect(actor) {
  const now = Date.now();

  return getPendingEffects(actor)
    .filter((effect) => {
      if (
        effect.measureId !==
        MEASURE_IDS.MAXIMIZE_DAMAGE
      ) {
        return false;
      }

      const expiresAt = Number(
        effect.expiresAt ??
          Number(effect.createdAt ?? 0) + 180000
      );

      return expiresAt >= now;
    })
    .sort(
      (left, right) =>
        Number(right.createdAt ?? 0) -
        Number(left.createdAt ?? 0)
    )[0] ?? null;
}

function maximizePendingDamage(
  rolls,
  config,
  message
) {
  const actor = config?.subject?.actor;

  if (
    !actor ||
    !Array.isArray(rolls) ||
    rolls.length === 0
  ) {
    return;
  }

  const effect =
    getActiveMaximizeEffect(actor);

  if (!effect) {
    const hasExpiredEffect =
      getPendingEffects(actor).some(
        (candidate) =>
          candidate.measureId ===
          MEASURE_IDS.MAXIMIZE_DAMAGE
      );

    if (hasExpiredEffect) {
      clearMaximizeDamageEffects(actor).catch(
        (error) => console.error(
          "Desperate Measures | Nie udalo sie usunac wygaslego efektu obrazen.",
          error
        )
      );
    }

    return;
  }

  let maximizedDice = 0;

  for (const roll of rolls) {
    for (const die of roll.dice ?? []) {
      const faces = Number(die.faces);

      if (
        !Number.isInteger(faces) ||
        faces < 2
      ) {
        continue;
      }

      const modifier = `min${faces}`;

      if (!die.modifiers.includes(modifier)) {
        die.modifiers.push(modifier);
      }

      maximizedDice += 1;
    }

    roll.options.desperateMeasuresMaximized =
      effect.id;
  }

  if (maximizedDice === 0) return;

  foundry.utils.setProperty(
    message,
    `data.flags.${MODULE_ID}.maximizeDamage`,
    {
      effectId: effect.id,
      actorId: actor.id,
      maximizedDice,
      appliedAt: Date.now()
    }
  );

  console.log(
    "Desperate Measures | Maksymalizacja obrazen aktywna",
    {
      actor: actor.name,
      rolls,
      maximizedDice,
      effect
    }
  );
}

async function clearMaximizeDamageEffects(actor) {
  const current = getPendingEffects(actor);

  const remaining = current.filter(
    (effect) =>
      effect.measureId !==
      MEASURE_IDS.MAXIMIZE_DAMAGE
  );

  if (remaining.length === current.length) {
    return;
  }

  await actor.setFlag(
    MODULE_ID,
    FLAGS.PENDING_EFFECTS,
    remaining
  );
}