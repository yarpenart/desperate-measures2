import {
  MODULE_ID,
  SETTINGS
} from "../constants/constants.js";

import { t }
  from "../i18n.js";

export function registerSettings() {
  game.settings.register(
    MODULE_ID,
    SETTINGS.LANGUAGE,
    {
      name: "Module language / Język modułu",
      hint:
        "Select the language used by Desperate Measures. / Wybierz język używany przez Desperate Measures.",
      scope: "client",
      config: true,
      type: String,
      choices: {
        en: "English",
        pl: "Polski"
      },
      default: "en",
      requiresReload: true
    }
  );

  game.settings.register(
    MODULE_ID,
    SETTINGS.BLOODIED_THRESHOLD,
    {
      name: t(
        "settings.bloodiedThreshold.name"
      ),
      hint: t(
        "settings.bloodiedThreshold.hint"
      ),
      scope: "world",
      config: true,
      type: Number,
      choices: {
        50: t(
          "settings.bloodiedThreshold.choice",
          { percent: 50 }
        ),
        40: t(
          "settings.bloodiedThreshold.choice",
          { percent: 40 }
        ),
        33: t(
          "settings.bloodiedThreshold.choice",
          { percent: 33 }
        ),
        25: t(
          "settings.bloodiedThreshold.choice",
          { percent: 25 }
        )
      },
      default: 50,
      requiresReload: false,
      onChange: () => refreshActorSheets()
    }
  );

  game.settings.register(
    MODULE_ID,
    SETTINGS.ALLOW_ZERO_HP,
    {
      name: t(
        "settings.allowZeroHP.name"
      ),
      hint: t(
        "settings.allowZeroHP.hint"
      ),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: false,
      onChange: () => refreshActorSheets()
    }
  );

  game.settings.register(
    MODULE_ID,
    SETTINGS.REQUIRE_COMBAT,
    {
      name: t(
        "settings.requireCombat.name"
      ),
      hint: t(
        "settings.requireCombat.hint"
      ),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: false,
      onChange: () => refreshActorSheets()
    }
  );

  game.settings.register(
    MODULE_ID,
    SETTINGS.RESET_ON_LONG_REST,
    {
      name: t(
        "settings.resetOnLongRest.name"
      ),
      hint: t(
        "settings.resetOnLongRest.hint"
      ),
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: false
    }
  );

  game.settings.register(
    MODULE_ID,
    SETTINGS.SHOW_CHAT_MESSAGES,
    {
      name: t(
        "settings.showChatMessages.name"
      ),
      hint: t(
        "settings.showChatMessages.hint"
      ),
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: false
    }
  );
}

function refreshActorSheets() {
  if (!game?.actors) return;

  for (const actor of game.actors) {
    for (
      const application of
      Object.values(actor.apps ?? {})
    ) {
      application.render(false);
    }
  }
}