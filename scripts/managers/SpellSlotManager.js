const MODULE_ID = "desperate-measures";

export class SpellSlotManager {
  static MIN_LEVEL = 1;
  static MAX_LEVEL = 5;

  static getSlotKey(level) {
    return `spell${level}`;
  }

  static getSlotData(actor, level) {
    const numericLevel = Number(level);

    if (
      !actor ||
      !Number.isInteger(numericLevel) ||
      numericLevel < this.MIN_LEVEL ||
      numericLevel > this.MAX_LEVEL
    ) {
      return null;
    }

    const key = this.getSlotKey(numericLevel);
    const slot = actor.system?.spells?.[key];

    if (!slot) return null;

    const value = Number(slot.value ?? 0);
    const maximum = Number(slot.max ?? 0);

    return {
      key,
      level: numericLevel,
      value,
      maximum,
      missing: Math.max(0, maximum - value),
      canRecover:
        maximum > 0 &&
        value < maximum
    };
  }

  static getAvailableSlots(actor) {
    const slots = [];

    for (
      let level = this.MIN_LEVEL;
      level <= this.MAX_LEVEL;
      level += 1
    ) {
      const slot = this.getSlotData(actor, level);

      if (slot) {
        slots.push(slot);
      }
    }

    return slots;
  }

  static hasRecoverableSlot(actor) {
    return this.getAvailableSlots(actor).some(
      (slot) => slot.canRecover
    );
  }

  static async recoverSlot(actor, level) {
    const slot = this.getSlotData(actor, level);

    if (!slot) {
      ui.notifications.warn(
        "Nie znaleziono wybranego poziomu slotu."
      );

      return null;
    }

    if (slot.maximum <= 0) {
      ui.notifications.warn(
        `Postać nie posiada slotów ${slot.level}. poziomu.`
      );

      return null;
    }

    if (!slot.canRecover) {
      ui.notifications.warn(
        `Sloty ${slot.level}. poziomu są już pełne.`
      );

      return null;
    }

    const newValue = Math.min(
      slot.value + 1,
      slot.maximum
    );

    await actor.update({
      [`system.spells.${slot.key}.value`]: newValue
    });

    return {
      ...slot,
      previousValue: slot.value,
      newValue
    };
  }

  static async createRecoveryMessage(
    actor,
    recovery
  ) {
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

    await ChatMessage.create({
      user: game.user.id,

      speaker: ChatMessage.getSpeaker({
        actor
      }),

      whisper,

      content: `
        <section class="desperate-measures-chat">
          <header>
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <strong>Desperate Measures</strong>
          </header>

          <p>
            <strong>${actor.name}</strong>
            odzyskuje slot zaklęcia
            <strong>${recovery.level}. poziomu</strong>.
          </p>

          <p>
            Sloty:
            <strong>
              ${recovery.previousValue}
              →
              ${recovery.newValue}
              /
              ${recovery.maximum}
            </strong>
          </p>
        </section>
      `
    });
  }
}