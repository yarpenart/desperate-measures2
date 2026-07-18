import {
  MODULE_ID,
  SETTINGS,
  FLAGS,
  MEASURE_IDS
} from "../constants/constants.js";

import { SpellSlotManager }
  from "./SpellSlotManager.js";

import { RollManager }
  from "./RollManager.js";

export class DesperateManager {

  static MEASURES = {
    dashDisengage: {
      id: MEASURE_IDS.DASH_DISENGAGE,
      name: "Dash + Disengage",
      cost: 1,
      icon: "fa-person-running",
      description:
        "Natychmiast możesz wykonać Dash i Disengage jako dodatkowe akcje."
    },

    plusFive: {
      id: MEASURE_IDS.PLUS_FIVE,
      name: "+5 do nieudanego testu",
      cost: 1,
      icon: "fa-dice-d20",
      description:
        "Dodaj +5 do właśnie nieudanego testu d20."
    },

    rerollAttack: {
      id: MEASURE_IDS.REROLL_ATTACK,
      name: "Przerzut nieudanego ataku",
      cost: 1,
      icon: "fa-rotate",
      description:
        "Przerzuć właśnie nieudany rzut ataku."
    },

    maximizeDamage: {
      id: MEASURE_IDS.MAXIMIZE_DAMAGE,
      name: "Maksymalne obrażenia",
      cost: 2,
      icon: "fa-burst",
      description:
        "Jeżeli atak trafi, każda kość obrażeń zadaje maksymalną wartość."
    },

    extraAction: {
      id: MEASURE_IDS.EXTRA_ACTION,
      name: "Dodatkowa akcja Attack lub Magic",
      cost: 3,
      icon: "fa-bolt",
      description:
        "Natychmiast wykonaj dodatkową akcję Attack albo Magic."
    },

    recoverSpellSlot: {
      id: MEASURE_IDS.RECOVER_SPELL_SLOT,
      name: "Odzyskaj slot zaklęcia",
      cost: 3,
      icon: "fa-wand-magic-sparkles",
      description:
        "Odzyskaj zużyty slot zaklęcia poziomu od 1 do 5."
    }
  };

  static getFailures(actor) {
    if (!actor) return 0;

    return Number(
      actor.system?.attributes?.death?.failure ?? 0
    );
  }

  static getMeasure(measureId) {
    return this.MEASURES[measureId] ?? null;
  }

  static getPendingEffects(actor) {
    if (!actor) return [];

    const effects = actor.getFlag(
      MODULE_ID,
      FLAGS.PENDING_EFFECTS
    );

    return Array.isArray(effects) ? effects : [];
  }

  static canAddFailures(actor, amount) {
    const current = this.getFailures(actor);
    const cost = Number(amount);

    return (
      Number.isInteger(cost) &&
      cost > 0 &&
      current + cost <= 3
    );
  }

  static canUseMeasure(actor, measureId) {
    const measure = this.getMeasure(measureId);

    if (!actor || !measure) {
      return {
        allowed: false,
        reason: "Nie znaleziono postaci lub wybranej opcji."
      };
    }

    const hp = actor.system?.attributes?.hp;
    const currentHP = Number(hp?.value ?? 0);
    const maximumHP = Number(hp?.max ?? 0);

    if (maximumHP <= 0) {
      return {
        allowed: false,
        reason: "Postać nie ma poprawnie ustawionych maksymalnych HP."
      };
    }

    if (
      currentHP <= 0 ||
      currentHP > maximumHP / 2
    ) {
      return {
        allowed: false,
        reason:
          "Desperate Measures można użyć tylko przy połowie maksymalnych HP lub mniej."
      };
    }

    if (!this.canAddFailures(actor, measure.cost)) {
      return {
        allowed: false,
        reason:
          `Ta opcja kosztuje ${measure.cost} porażki death save, ` +
          "a postać nie ma wystarczająco wolnych pól."
      };
    }
    
    if (measureId === MEASURE_IDS.PLUS_FIVE) {
      const rollValidation =
        RollManager.canApplyPlusFive(actor);

      if (!rollValidation.allowed) {
        return rollValidation;
      }
    }

        if (measureId === MEASURE_IDS.REROLL_ATTACK) {
      const rollValidation =
        RollManager.canRerollAttack(actor);

      if (!rollValidation.allowed) {
        return rollValidation;
      }
    }
        if (measureId === MEASURE_IDS.MAXIMIZE_DAMAGE) {
      const rollValidation =
        RollManager.canRerollAttack(actor);

      if (!rollValidation.allowed) {
        return rollValidation;
      }
    }

    if (
  measureId ===
  MEASURE_IDS.RECOVER_SPELL_SLOT &&
  !SpellSlotManager.hasRecoverableSlot(actor)
) {
  return {
    allowed: false,
    reason:
      "Postać nie ma zużytego slotu zaklęcia poziomu 1–5."
  };
}

    return {
      allowed: true,
      reason: ""
    };
  }

  static async addFailures(actor, amount) {
    if (!actor) {
      throw new Error(
        "Desperate Measures | Nie przekazano aktora."
      );
    }

    const cost = Number(amount);

    if (!this.canAddFailures(actor, cost)) {
      ui.notifications.warn(
        "Nie możesz zaznaczyć tylu porażek death save."
      );

      return this.getFailures(actor);
    }

    const newValue =
      this.getFailures(actor) + cost;

    await actor.update({
      "system.attributes.death.failure": newValue
    });

    return newValue;
  }

    static async addPendingEffect(actor, measureId) {
    const current = this.getPendingEffects(actor);
    const createdAt = Date.now();

    const sourceRoll =
      measureId === MEASURE_IDS.MAXIMIZE_DAMAGE
        ? RollManager.getLastRoll(actor)
        : null;

    const effect = {
      id: foundry.utils.randomID(),
      measureId,
      createdAt,
      createdBy: game.user.id,

      ...(sourceRoll
        ? {
            sourceRollId: sourceRoll.id,
            sourceIdentifier:
              sourceRoll.identifier ?? null,
            expiresAt: createdAt + 120000
          }
        : {})
    };

    await actor.setFlag(
      MODULE_ID,
      FLAGS.PENDING_EFFECTS,
      [...current, effect]
    );

    return effect;
  }

  static async removePendingEffect(actor, effectId) {
    const remaining =
      this.getPendingEffects(actor).filter(
        (effect) => effect.id !== effectId
      );

    await actor.setFlag(
      MODULE_ID,
      FLAGS.PENDING_EFFECTS,
      remaining
    );

    return remaining;
  }

      static async useMeasure(actor, measureId) {
    const measure = this.getMeasure(measureId);

    const validation =
      this.canUseMeasure(actor, measureId);

    if (!validation.allowed) {
      ui.notifications.warn(
        validation.reason
      );

      return null;
    }

    let appliedEffect = null;

    if (measureId === MEASURE_IDS.PLUS_FIVE) {
      appliedEffect =
        await RollManager.applyPlusFive(actor);

      if (!appliedEffect) return null;
    }

    if (measureId === MEASURE_IDS.REROLL_ATTACK) {
      appliedEffect =
        await RollManager.applyRerollAttack(actor);

      if (!appliedEffect) return null;
    }

    const failures = await this.addFailures(
      actor,
      measure.cost
    );

        const immediateMeasures = [
      MEASURE_IDS.PLUS_FIVE,
      MEASURE_IDS.REROLL_ATTACK
    ];

    const pendingEffect =
      immediateMeasures.includes(measureId)
        ? null
        : await this.addPendingEffect(
            actor,
            measureId
          );

              if (
      measureId ===
      MEASURE_IDS.MAXIMIZE_DAMAGE
    ) {
      await RollManager.markUsed(actor);
    }

    await this.createUsageMessage(
      actor,
      measure,
      failures
    );

    ui.notifications.info(
      `${actor.name} używa: ${measure.name}`
    );

    return {
      actor,
      measure,
      failures,
      pendingEffect,
      appliedEffect
    };
  }

  static async createUsageMessage(
    actor,
    measure,
    failures
  ) {
    const showChat = game.settings.get(
  MODULE_ID,
  SETTINGS.SHOW_CHAT_MESSAGES
);

if (!showChat) return;
    const users = game.users.filter((user) => {
      if (user.isGM) return true;

      return actor.testUserPermission(
        user,
        CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
      );
    });

    const whisper = [
      ...new Set(users.map((user) => user.id))
    ];

    const skulls =
      "☠".repeat(failures) +
      "○".repeat(Math.max(0, 3 - failures));

    const content = `
      <section class="desperate-measures-chat">
        <header>
          <i class="fa-solid fa-heart-crack"></i>
          <strong>Desperate Measures</strong>
        </header>

        <p>
          <strong>${actor.name}</strong>
          wykorzystuje:
        </p>

        <h3>${measure.name}</h3>

        <p>${measure.description}</p>

        <hr>

        <p>
          Koszt:
          <strong>
            ${measure.cost}
            ${measure.cost === 1 ? "porażka" : "porażki"}
            death save
          </strong>
        </p>

        <p>
          Aktualny stan:
          <span class="desperate-measures-chat-skulls">
            ${skulls}
          </span>
        </p>
      </section>
    `;

    await ChatMessage.create({
      user: game.user.id,

      speaker: ChatMessage.getSpeaker({
        actor
      }),

      content,

      whisper
    });
  }

  static async reset(actor) {
    if (!actor) return;

    await actor.update({
      "system.attributes.death.failure": 0
    });

    await actor.unsetFlag(
      MODULE_ID,
      "pendingEffects"
    );
  }
}