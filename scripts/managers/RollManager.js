import {
  MODULE_ID,
  FLAGS
} from "../constants/constants.js";

import { t }
  from "../i18n.js";

export class RollManager {
  static SUPPORTED_TYPES = [
    "abilityTest",
    "abilitySave",
    "skill",
    "toolCheck",
    "attack"
  ];

  static getLastRoll(actor) {
    if (!actor) return null;

    return actor.getFlag(
      MODULE_ID,
      FLAGS.LAST_D20_ROLL
    ) ?? null;
  }

  static async storeRoll(
    actor,
    roll,
    type,
    identifier = null
  ) {
    if (!actor || !roll) return null;

    if (!this.SUPPORTED_TYPES.includes(type)) {
      return null;
    }

    const message = roll.parent?.id
      ? roll.parent
      : null;

    const matchedIndex = message?.rolls?.findIndex(
      (candidate) =>
        candidate.formula === roll.formula &&
        candidate.total === roll.total
    );

    const data = {
      id: foundry.utils.randomID(),
      type,
      identifier,
      formula: roll.formula ?? "",
      total: Number(roll.total ?? 0),
      messageId: message?.id ?? null,
      rollIndex:
        Number.isInteger(matchedIndex) &&
        matchedIndex >= 0
          ? matchedIndex
          : 0,
      createdAt: Date.now(),
      createdBy: game.user.id,
      used: false
    };

    await actor.setFlag(
      MODULE_ID,
      FLAGS.LAST_D20_ROLL,
      data
    );

    console.log(
      "Desperate Measures | Captured d20 roll",
      {
        actor: actor.name,
        roll,
        data
      }
    );

    return data;
  }

  static async markUsed(actor) {
    const lastRoll = this.getLastRoll(actor);

    if (!lastRoll) return null;

    const updated = {
      ...lastRoll,
      used: true,
      usedAt: Date.now()
    };

    await actor.setFlag(
      MODULE_ID,
      FLAGS.LAST_D20_ROLL,
      updated
    );

    return updated;
  }

  static async clear(actor) {
    if (!actor) return;

    await actor.unsetFlag(
      MODULE_ID,
      FLAGS.LAST_D20_ROLL
    );
  }

  static isRecent(
    rollData,
    maximumAge = 120000
  ) {
    if (!rollData?.createdAt) return false;

    return (
      Date.now() - rollData.createdAt <=
      maximumAge
    );
  }

  static canApplyPlusFive(actor) {
    const lastRoll = this.getLastRoll(actor);

    if (!lastRoll) {
      return {
        allowed: false,
        reason: t("roll.noSupportedRoll")
      };
    }


    if (lastRoll.used) {
      return {
        allowed: false,
        reason: t("roll.alreadyUsed")
      };
    }

    if (!this.isRecent(lastRoll)) {
      return {
        allowed: false,
        reason: t("roll.tooOld")
      };
    }

    if (!lastRoll.messageId) {
      return {
        allowed: false,
        reason: t("roll.noMessage")
      };
    }

    const message = game.messages?.get(
      lastRoll.messageId
    );

    const rollIndex = Number(
      lastRoll.rollIndex ?? 0
    );

    if (!message?.rolls?.[rollIndex]) {
      return {
        allowed: false,
        reason: t("roll.messageUnavailable")
      };
    }

    return {
      allowed: true,
      reason: ""
    };
  }

  static canRerollAttack(actor) {
    const lastRoll = this.getLastRoll(actor);

    if (!lastRoll) {
      return {
        allowed: false,
        reason: t("roll.noAttack")
      };
    }

    if (lastRoll.type !== "attack") {
      return {
        allowed: false,
        reason: t("roll.notAttack")
      };
    }

    if (lastRoll.used) {
      return {
        allowed: false,
        reason: t("roll.alreadyUsed")
      };
    }

    if (!this.isRecent(lastRoll)) {
      return {
        allowed: false,
        reason: t("roll.attackTooOld")
      };
    }

    if (!lastRoll.messageId) {
      return {
        allowed: false,
        reason: t("roll.noAttackMessage")
      };
    }

    const message = game.messages?.get(
      lastRoll.messageId
    );

    const rollIndex = Number(
      lastRoll.rollIndex ?? 0
    );

    if (!message?.rolls?.[rollIndex]) {
      return {
        allowed: false,
        reason: t(
          "roll.attackMessageUnavailable"
        )
      };
    }

    return {
      allowed: true,
      reason: ""
    };
  }

  static async applyPlusFive(actor) {
    const validation =
      this.canApplyPlusFive(actor);

    if (!validation.allowed) {
      ui.notifications.warn(
        validation.reason
      );

      return null;
    }

    const lastRoll = this.getLastRoll(actor);

    const message = game.messages.get(
      lastRoll.messageId
    );

    const rollIndex = Number(
      lastRoll.rollIndex ?? 0
    );

    const originalRoll =
      message.rolls[rollIndex];

    const originalTotal = Number(
      originalRoll.total ?? 0
    );

    try {
      const clonedTerms =
        originalRoll.terms.map(
          (term) =>
            term.constructor.fromData(
              term.toJSON()
            )
        );

      const operatorTerm =
        new foundry.dice.terms.OperatorTerm({
          operator: "+"
        });

      const bonusTerm =
        new foundry.dice.terms.NumericTerm({
          number: 5,
          options: {
            flavor: "Desperate Measures"
          }
        });

      await bonusTerm.evaluate();

      clonedTerms.push(
        operatorTerm,
        bonusTerm
      );

      const adjustedRoll =
        originalRoll.constructor.fromTerms(
          clonedTerms,
          foundry.utils.deepClone(
            originalRoll.options ?? {}
          )
        );

      const updatedRolls =
        message.rolls.map(
          (currentRoll, index) =>
            index === rollIndex
              ? adjustedRoll.toJSON()
              : currentRoll.toJSON()
        );

      await message.update({
        rolls: updatedRolls,

        [`flags.${MODULE_ID}.plusFive`]: {
          actorId: actor.id,
          originalTotal,
          adjustedTotal:
            adjustedRoll.total,
          appliedAt: Date.now(),
          appliedBy: game.user.id
        }
      });

      await this.markUsed(actor);

      return {
        message,
        originalTotal,
        adjustedTotal: Number(
          adjustedRoll.total
        )
      };
    } catch (error) {
      console.error(
        "Desperate Measures | Nie udalo sie dodac +5 do rzutu.",
        error
      );

      ui.notifications.error(
        t("roll.plusFiveError")
      );

      return null;
    }
  }

    static async applyRerollAttack(actor) {
    const validation =
      this.canRerollAttack(actor);

    if (!validation.allowed) {
      ui.notifications.warn(
        validation.reason
      );

      return null;
    }

    const lastRoll = this.getLastRoll(actor);

    const message = game.messages.get(
      lastRoll.messageId
    );

    const rollIndex = Number(
      lastRoll.rollIndex ?? 0
    );

    const originalRoll =
      message.rolls[rollIndex];

    const originalTotal = Number(
      originalRoll.total ?? 0
    );

    try {
      const rerolledRoll =
        await originalRoll.reroll();

      const rerollMessage =
        await rerolledRoll.toMessage({
          user: game.user.id,

          speaker:
            foundry.utils.deepClone(
              message.speaker ?? {}
            ),

          flavor: `
            <div class="desperate-measures-reroll-flavor">
              <strong>
                <i class="fa-solid fa-rotate"></i>
                ${t("roll.rerollFlavor")}
              </strong>
              ${message.flavor
                ? `<div>${message.flavor}</div>`
                : ""}
            </div>
          `,

          whisper: Array.from(
            message.whisper ?? []
          ),

          blind: Boolean(message.blind),

          flags: {
            dnd5e:
              foundry.utils.deepClone(
                message.flags?.dnd5e ?? {}
              ),

            [MODULE_ID]: {
              rerollAttack: {
                isReroll: true,
                originalMessageId: message.id,
                actorId: actor.id,
                originalTotal,
                rerolledTotal:
                  rerolledRoll.total,
                appliedAt: Date.now(),
                appliedBy: game.user.id
              }
            }
          }
        });

      await message.update({
        [`flags.${MODULE_ID}.rerollAttack`]: {
          replaced: true,
          rerollMessageId: rerollMessage.id,
          actorId: actor.id,
          originalTotal,
          rerolledTotal:
            rerolledRoll.total,
          appliedAt: Date.now(),
          appliedBy: game.user.id
        }
      });

      await this.markUsed(actor);

      return {
        originalMessage: message,
        rerollMessage,
        originalTotal,
        rerolledTotal: Number(
          rerolledRoll.total
        )
      };
    } catch (error) {
      console.error(
        "Desperate Measures | Nie udalo sie przerzucic ataku.",
        error
      );

      ui.notifications.error(
        t("roll.rerollError")
      );

      return null;
    }
  }
}