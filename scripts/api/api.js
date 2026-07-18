import { BloodiedManager } from "../managers/BloodiedManager.js";
import { DesperateManager } from "../managers/DesperateManager.js";
import { SpellSlotManager } from "../managers/SpellSlotManager.js";
import { RollManager } from "../managers/RollManager.js";

export function registerAPI() {
  game.desperateMeasures = {
    isBloodied(actor) {
      return BloodiedManager.isBloodied(actor);
    },

    getFailures(actor) {
      return DesperateManager.getFailures(actor);
    },

    addFailures(actor, amount) {
      return DesperateManager.addFailures(actor, amount);
    },

    reset(actor) {
      return DesperateManager.reset(actor);
    },

    use(actor, measureId) {
      return DesperateManager.useMeasure(actor, measureId);
    },

    getMeasure(measureId) {
      return DesperateManager.getMeasure(measureId);
    },

    getMeasures() {
      return foundry.utils.deepClone(DesperateManager.MEASURES);
    },

    getPendingEffects(actor) {
      return DesperateManager.getPendingEffects(actor);
    },

    removePendingEffect(actor, effectId) {
      return DesperateManager.removePendingEffect(actor, effectId);
    },

    recoverSpellSlot(actor, level) {
      return SpellSlotManager.recoverSlot(actor, level);
    },

    getRecoverableSpellSlots(actor) {
      return SpellSlotManager.getAvailableSlots(actor).filter((slot) => slot.canRecover);
    },

    getLastD20Roll(actor) {
      return RollManager.getLastRoll(actor);
    },

    canApplyPlusFive(actor) {
      return RollManager.canApplyPlusFive(actor);
    },

    clearLastD20Roll(actor) {
      return RollManager.clear(actor);
    }
  };
}