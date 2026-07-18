import {
  MODULE_ID,
  SETTINGS,
  FLAGS
} from "../constants/constants.js";

export class BloodiedManager {
  static getThreshold() {
    const percentage = Number(
      game.settings.get(
        MODULE_ID,
        SETTINGS.BLOODIED_THRESHOLD
      )
    );

    return percentage / 100;
  }

  static allowZeroHP() {
    return game.settings.get(
      MODULE_ID,
      SETTINGS.ALLOW_ZERO_HP
    );
  }

  static requiresCombat() {
    return game.settings.get(
      MODULE_ID,
      SETTINGS.REQUIRE_COMBAT
    );
  }

  static isCombatActive() {
    const combat = game.combat;

    return Boolean(
      combat &&
      combat.started
    );
  }

  static isBloodied(actor) {
    if (!actor) return false;

    const hp =
      actor.system?.attributes?.hp;

    if (!hp) return false;

    const current = Number(
      hp.value ?? 0
    );

    const maximum = Number(
      hp.max ?? 0
    );

    if (maximum <= 0) {
      return false;
    }

    if (
      current <= 0 &&
      !this.allowZeroHP()
    ) {
      return false;
    }

    if (
      this.requiresCombat() &&
      !this.isCombatActive()
    ) {
      return false;
    }

    const threshold =
      maximum * this.getThreshold();

    return current <= threshold;
  }

  static async update(actor) {
    if (!actor) return false;

    const bloodied =
      this.isBloodied(actor);

    const previous =
      actor.getFlag(
        MODULE_ID,
        FLAGS.BLOODIED
      );

    if (previous !== bloodied) {
      await actor.setFlag(
        MODULE_ID,
        FLAGS.BLOODIED,
        bloodied
      );
    }

    return bloodied;
  }
}