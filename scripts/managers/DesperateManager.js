export class DesperateManager {
  static getFailures(actor) {
    if (!actor) return 0;

    return Number(
      actor.system?.attributes?.death?.failure ?? 0
    );
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

  static async addFailures(actor, amount) {
    if (!actor) {
      throw new Error(
        "Desperate Measures | No actor provided."
      );
    }

    const cost = Number(amount);

    if (!this.canAddFailures(actor, cost)) {
      ui.notifications.warn(
        "Nie możesz zaznaczyć tylu niezdanych death save’ów."
      );

      return this.getFailures(actor);
    }

    const newValue = this.getFailures(actor) + cost;

    await actor.update({
      "system.attributes.death.failure": newValue
    });

    return newValue;
  }

  static async reset(actor) {
    if (!actor) return;

    await actor.update({
      "system.attributes.death.failure": 0
    });
  }
}