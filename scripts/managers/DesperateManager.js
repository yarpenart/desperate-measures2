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

import {
  t,
  deathSaveFailureLabel
} from "../i18n.js";

export class DesperateManager {

  static MEASURES = {
    dashDisengage: {
      id: MEASURE_IDS.DASH_DISENGAGE,
      get name() {
        return t("measure.dashDisengage.name");
      },
      cost: 1,
      icon: "fa-person-running",
      get description() {
        return t(
          "measure.dashDisengage.description"
        );
      }
    },

    plusFive: {
      id: MEASURE_IDS.PLUS_FIVE,
      get name() {
        return t("measure.plusFive.name");
      },
      cost: 1,
      icon: "fa-dice-d20",
      get description() {
        return t(
          "measure.plusFive.description"
        );
      }
    },

    rerollAttack: {
      id: MEASURE_IDS.REROLL_ATTACK,
      get name() {
        return t("measure.rerollAttack.name");
      },
      cost: 1,
      icon: "fa-rotate",
      get description() {
        return t(
          "measure.rerollAttack.description"
        );
      }
    },

    maximizeDamage: {
      id: MEASURE_IDS.MAXIMIZE_DAMAGE,
      get name() {
        return t("measure.maximizeDamage.name");
      },
      cost: 2,
      icon: "fa-burst",
      get description() {
        return t(
          "measure.maximizeDamage.description"
        );
      }
    },

    extraAction: {
      id: MEASURE_IDS.EXTRA_ACTION,
      get name() {
        return t("measure.extraAction.name");
      },
      cost: 3,
      icon: "fa-bolt",
      get description() {
        return t(
          "measure.extraAction.description"
        );
      }
    },

    recoverSpellSlot: {
      id: MEASURE_IDS.RECOVER_SPELL_SLOT,
      get name() {
        return t("measure.recoverSpellSlot.name");
      },
      cost: 3,
      icon: "fa-wand-magic-sparkles",
      get description() {
        return t(
          "measure.recoverSpellSlot.description"
        );
      }
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
        reason: t(
          "validation.missingActorOrMeasure"
        )
      };
    }

    const hp = actor.system?.attributes?.hp;
    const currentHP = Number(hp?.value ?? 0);
    const maximumHP = Number(hp?.max ?? 0);

    if (maximumHP <= 0) {
      return {
        allowed: false,
        reason: t(
          "validation.invalidMaximumHP"
        )
      };
    }

    if (
      currentHP <= 0 ||
      currentHP > maximumHP / 2
    ) {
      return {
        allowed: false,
        reason: t(
          "validation.hpThreshold"
        )
      };
    }

    if (!this.canAddFailures(actor, measure.cost)) {
      return {
        allowed: false,
        reason: t(
          "validation.notEnoughFailureSlots",
          {
            cost: measure.cost,
            failureLabel:
              deathSaveFailureLabel(
                measure.cost
              )
          }
        )
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
    reason: t(
      "validation.noRecoverableSlot"
    )
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
        t("validation.cannotAddFailures")
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
            expiresAt: createdAt + 180000
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
      t("usage.notification", {
        actor: actor.name,
        measure: measure.name
      })
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
          <strong>
            ${t("usage.chatUses", {
              actor: actor.name
            })}
          </strong>
        </p>

        <h3>${measure.name}</h3>

        <p>${measure.description}</p>

        <hr>

        <p>
          ${t("common.cost")}:
          <strong>
            ${measure.cost}
            ${deathSaveFailureLabel(measure.cost)}
          </strong>
        </p>

        <p>
          ${t("common.currentState")}:
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