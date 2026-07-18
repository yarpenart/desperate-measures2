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

    const data = {
      id: foundry.utils.randomID(),
      type,
      identifier,
      formula: roll.formula ?? "",
      total: Number(roll.total ?? 0),
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

  static isRecent(rollData, maximumAge = 120000) {
    if (!rollData?.createdAt) return false;

    return (
      Date.now() - rollData.createdAt <= maximumAge
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

    return {
      allowed: true,
      reason: ""
    };
  }
}