export class BloodiedManager {
  static isBloodied(actor) {
    if (!actor) return false;

    const hp = actor.system?.attributes?.hp;
    if (!hp) return false;

    const current = Number(hp.value ?? 0);
    const maximum = Number(hp.max ?? 0);

    if (maximum <= 0) return false;

    return current > 0 && current <= maximum / 2;
  }

  static async update(actor) {
    if (!actor) return false;

    const bloodied = this.isBloodied(actor);

    await actor.setFlag(
      "desperate-measures",
      "bloodied",
      bloodied
    );

    return bloodied;
  }
}