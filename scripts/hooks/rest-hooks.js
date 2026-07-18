import {
  MODULE_ID,
  SETTINGS
} from "../constants/constants.js";

import { DesperateManager }
  from "../managers/DesperateManager.js";

export function registerRestHooks() {
  Hooks.on(
    "dnd5e.restCompleted",
    async (actor, result) => {
      if (!actor) return;

      const resetEnabled =
        game.settings.get(
          MODULE_ID,
          SETTINGS.RESET_ON_LONG_REST
        );

      if (!resetEnabled) return;

      if (!isLongRest(result)) return;

      await DesperateManager.reset(actor);

      ui.notifications.info(
        `${actor.name}: Desperate Measures zostały zresetowane po długim odpoczynku.`
      );
    }
  );
}

function isLongRest(result) {
  if (!result) return false;

  if (result.type === "long") {
    return true;
  }

  if (result.restType === "long") {
    return true;
  }

  if (result.longRest === true) {
    return true;
  }

  return false;
}