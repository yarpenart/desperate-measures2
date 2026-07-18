import {
  MODULE_ID,
  SETTINGS
} from "../constants/constants.js";

export function registerSettings() {
  game.settings.register(
    MODULE_ID,
    SETTINGS.BLOODIED_THRESHOLD,
    {
      name: "Próg Bloodied",
      hint:
        "Procent maksymalnych HP, przy którym Desperate Measures stają się dostępne.",
      scope: "world",
      config: true,
      type: Number,
      choices: {
        50: "50% maksymalnych HP",
        40: "40% maksymalnych HP",
        33: "33% maksymalnych HP",
        25: "25% maksymalnych HP"
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
      name: "Pozwól używać przy 0 HP",
      hint:
        "Pozwala korzystać z Desperate Measures postaciom nieprzytomnym z 0 HP.",
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
      name: "Wymagaj aktywnej walki",
      hint:
        "Desperate Measures będą dostępne wyłącznie podczas aktywnego encounteru.",
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
      name: "Resetuj po długim odpoczynku",
      hint:
        "Usuwa porażki death save i oczekujące efekty po ukończeniu długiego odpoczynku.",
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
      name: "Pokazuj raporty na czacie",
      hint:
        "Wysyła informacje o wykorzystaniu Desperate Measures do gracza i GM-a.",
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