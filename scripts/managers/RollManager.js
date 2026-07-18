import {
  MODULE_ID,
  FLAGS
} from "../constants/constants.js";

export class RollManager {
  static SUPPORTED_TYPES = [
    "abilityTest",
    "abilitySave",
    "skill",
    "toolCheck"
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
        reason:
          "Postać nie wykonała jeszcze obsługiwanego testu d20."
      };
    }

    if (lastRoll.used) {
      return {
        allowed: false,
        reason:
          "Do tego rzutu wykorzystano już Desperate Measure."
      };
    }

    if (!this.isRecent(lastRoll)) {
      return {
        allowed: false,
        reason:
          "Ostatni test jest zbyt stary. Wykonaj nowy test d20."
      };
    }

    if (!lastRoll.messageId) {
      return {
        allowed: false,
        reason:
          "Nie znaleziono wiadomości czatu powiązanej z ostatnim rzutem."
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
        reason:
          "Wiadomość ostatniego rzutu nie jest już dostępna."
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

      await operatorTerm.evaluate();
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
        "Desperate Measures | Nie udało się dodać +5 do rzutu.",
        error
      );

      ui.notifications.error(
        "Nie udało się dodać +5 do ostatniego rzutu. Sprawdź konsolę."
      );

      return null;
    }
  }
}