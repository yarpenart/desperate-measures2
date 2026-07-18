import {
  MODULE_ID,
  SETTINGS
} from "./constants/constants.js";

const TRANSLATIONS = {
  en: {
    "settings.bloodiedThreshold.name": "Bloodied threshold",
    "settings.bloodiedThreshold.hint":
      "Percentage of maximum HP at which Desperate Measures become available.",
    "settings.bloodiedThreshold.choice": "{percent}% of maximum HP",
    "settings.allowZeroHP.name": "Allow use at 0 HP",
    "settings.allowZeroHP.hint":
      "Allows unconscious characters at 0 HP to use Desperate Measures.",
    "settings.requireCombat.name": "Require active combat",
    "settings.requireCombat.hint":
      "Desperate Measures are available only during an active encounter.",
    "settings.resetOnLongRest.name": "Reset after a long rest",
    "settings.resetOnLongRest.hint":
      "Clears death save failures and pending effects after completing a long rest.",
    "settings.showChatMessages.name": "Show chat reports",
    "settings.showChatMessages.hint":
      "Sends information about the use of Desperate Measures to the player and GM.",

    "measure.dashDisengage.name": "Dash + Disengage",
    "measure.dashDisengage.description":
      "Immediately take both Dash and Disengage as additional actions.",
    "measure.plusFive.name": "+5 to a failed check",
    "measure.plusFive.description":
      "Add +5 to the d20 check that was just failed.",
    "measure.rerollAttack.name": "Reroll a failed attack",
    "measure.rerollAttack.description":
      "Reroll the attack roll that was just failed.",
    "measure.maximizeDamage.name": "Maximum damage",
    "measure.maximizeDamage.description":
      "If the attack hits, every damage die deals its maximum value.",
    "measure.extraAction.name": "Additional Attack or Magic action",
    "measure.extraAction.description":
      "Immediately take an additional Attack or Magic action.",
    "measure.recoverSpellSlot.name": "Recover a spell slot",
    "measure.recoverSpellSlot.description":
      "Recover one expended spell slot of level 1 through 5.",

    "common.deathSaveFailure.one": "death save failure",
    "common.deathSaveFailure.many": "death save failures",
    "common.hp": "HP",
    "common.cost": "Cost",
    "common.currentState": "Current state",

    "button.status": "Status",
    "button.bloodied": "BLOODIED",
    "button.unavailable": "Unavailable",
    "button.deathSaveFailures": "Death Save Failures",
    "button.failuresAria": "{count} of 3 failed death saves",
    "button.use": "Use Desperate Measure",
    "button.hint.available": "You can use a Desperate Measure.",
    "button.hint.maxFailures": "You already have 3 failed death saves.",
    "button.hint.hp": "Requires the configured HP threshold or less.",

    "dialog.characterNotFound": "Character not found.",
    "dialog.close": "Close",
    "dialog.deathSaves": "Death Saves",
    "dialog.selectionWarning":
      "Choosing an option immediately marks its cost as failed death saves.",
    "dialog.confirmTitle": "Confirm Desperate Measure",
    "dialog.confirmQuestion": "Are you sure you want to use:",
    "dialog.confirmWarning": "These boxes will be marked immediately.",

    "validation.missingActorOrMeasure":
      "The character or selected option could not be found.",
    "validation.invalidMaximumHP":
      "The character does not have valid maximum HP.",
    "validation.hpThreshold":
      "Desperate Measures can only be used while the character meets the configured HP threshold.",
    "validation.notEnoughFailureSlots":
      "This option costs {cost} {failureLabel}, and the character does not have enough empty boxes.",
    "validation.noRecoverableSlot":
      "The character has no expended spell slot of level 1 through 5.",
    "validation.cannotAddFailures":
      "You cannot mark this many death save failures.",

    "usage.notification": "{actor} uses: {measure}",
    "usage.chatUses": "{actor} uses:",

    "roll.noSupportedRoll":
      "The character has not made a supported d20 check yet.",
    "roll.alreadyUsed":
      "A Desperate Measure has already been used for this roll.",
    "roll.tooOld":
      "The last check is too old. Make a new d20 check.",
    "roll.noMessage":
      "The chat message for the last roll could not be found.",
    "roll.messageUnavailable":
      "The message for the last roll is no longer available.",
    "roll.noAttack": "The character has not made an attack roll yet.",
    "roll.notAttack": "The last captured roll is not an attack roll.",
    "roll.attackTooOld":
      "The last attack is too old. Make a new attack roll.",
    "roll.noAttackMessage":
      "The chat message for the last attack could not be found.",
    "roll.attackMessageUnavailable":
      "The message for the last attack is no longer available.",
    "roll.plusFiveError":
      "Could not add +5 to the last roll. Check the console.",
    "roll.rerollError":
      "Could not reroll the last attack. Check the console.",
    "roll.rerollFlavor": "Desperate Measures — attack reroll",
    "roll.replacedStatus":
      "This roll was replaced by Desperate Measures.",

    "slots.missingActorOrEffect":
      "The character or pending effect could not be found.",
    "slots.chooseLevel":
      "Choose the level of the spell slot you want to recover.",
    "slots.noSlotsAtLevel":
      "The character has no spell slots of this level.",
    "slots.fullAtLevel": "Spell slots of this level are already full.",
    "slots.level": "Level {level}",
    "slots.missing": "Missing: {count}",
    "slots.recoverTitle": "Recover a spell slot — {actor}",
    "slots.cancel": "Cancel",
    "slots.levelNotFound": "The selected spell slot level could not be found.",
    "slots.characterHasNone":
      "The character has no level {level} spell slots.",
    "slots.alreadyFull": "Level {level} spell slots are already full.",
    "slots.recovered": "{actor} recovers a level {level} spell slot.",
    "slots.chatRecovered":
      "{actor} recovers a level {level} spell slot.",
    "slots.chatSlots": "Slots",

    "rest.reset":
      "{actor}: Desperate Measures were reset after a long rest."
  },

  pl: {
    "settings.bloodiedThreshold.name": "Próg Bloodied",
    "settings.bloodiedThreshold.hint":
      "Procent maksymalnych HP, przy którym Desperate Measures stają się dostępne.",
    "settings.bloodiedThreshold.choice": "{percent}% maksymalnych HP",
    "settings.allowZeroHP.name": "Pozwól używać przy 0 HP",
    "settings.allowZeroHP.hint":
      "Pozwala korzystać z Desperate Measures postaciom nieprzytomnym z 0 HP.",
    "settings.requireCombat.name": "Wymagaj aktywnej walki",
    "settings.requireCombat.hint":
      "Desperate Measures będą dostępne wyłącznie podczas aktywnego encounteru.",
    "settings.resetOnLongRest.name": "Resetuj po długim odpoczynku",
    "settings.resetOnLongRest.hint":
      "Usuwa porażki death save i oczekujące efekty po ukończeniu długiego odpoczynku.",
    "settings.showChatMessages.name": "Pokazuj raporty na czacie",
    "settings.showChatMessages.hint":
      "Wysyła informacje o wykorzystaniu Desperate Measures do gracza i GM-a.",

    "measure.dashDisengage.name": "Dash + Disengage",
    "measure.dashDisengage.description":
      "Natychmiast możesz wykonać Dash i Disengage jako dodatkowe akcje.",
    "measure.plusFive.name": "+5 do nieudanego testu",
    "measure.plusFive.description":
      "Dodaj +5 do właśnie nieudanego testu d20.",
    "measure.rerollAttack.name": "Przerzut nieudanego ataku",
    "measure.rerollAttack.description":
      "Przerzuć właśnie nieudany rzut ataku.",
    "measure.maximizeDamage.name": "Maksymalne obrażenia",
    "measure.maximizeDamage.description":
      "Jeżeli atak trafi, każda kość obrażeń zadaje maksymalną wartość.",
    "measure.extraAction.name": "Dodatkowa akcja Attack lub Magic",
    "measure.extraAction.description":
      "Natychmiast wykonaj dodatkową akcję Attack albo Magic.",
    "measure.recoverSpellSlot.name": "Odzyskaj slot zaklęcia",
    "measure.recoverSpellSlot.description":
      "Odzyskaj zużyty slot zaklęcia poziomu od 1 do 5.",

    "common.deathSaveFailure.one": "porażka death save",
    "common.deathSaveFailure.many": "porażki death save",
    "common.hp": "HP",
    "common.cost": "Koszt",
    "common.currentState": "Aktualny stan",

    "button.status": "Status",
    "button.bloodied": "BLOODIED",
    "button.unavailable": "Niedostępne",
    "button.deathSaveFailures": "Porażki death save",
    "button.failuresAria": "{count} z 3 niezdanych death save’ów",
    "button.use": "Użyj Desperate Measure",
    "button.hint.available": "Możesz wykorzystać Desperate Measure.",
    "button.hint.maxFailures": "Masz już 3 niezdane death save’y.",
    "button.hint.hp": "Wymaga ustawionego progu HP lub mniej.",

    "dialog.characterNotFound": "Nie znaleziono postaci.",
    "dialog.close": "Zamknij",
    "dialog.deathSaves": "Death Saves",
    "dialog.selectionWarning":
      "Wybranie opcji natychmiast zaznaczy jej koszt jako niezdane death save’y.",
    "dialog.confirmTitle": "Potwierdź Desperate Measure",
    "dialog.confirmQuestion": "Czy na pewno chcesz użyć:",
    "dialog.confirmWarning": "Te pola zostaną zaznaczone natychmiast.",

    "validation.missingActorOrMeasure":
      "Nie znaleziono postaci lub wybranej opcji.",
    "validation.invalidMaximumHP":
      "Postać nie ma poprawnie ustawionych maksymalnych HP.",
    "validation.hpThreshold":
      "Desperate Measures można użyć tylko po osiągnięciu ustawionego progu HP.",
    "validation.notEnoughFailureSlots":
      "Ta opcja kosztuje {cost} {failureLabel}, a postać nie ma wystarczająco wolnych pól.",
    "validation.noRecoverableSlot":
      "Postać nie ma zużytego slotu zaklęcia poziomu od 1 do 5.",
    "validation.cannotAddFailures":
      "Nie możesz zaznaczyć tylu porażek death save.",

    "usage.notification": "{actor} używa: {measure}",
    "usage.chatUses": "{actor} wykorzystuje:",

    "roll.noSupportedRoll":
      "Postać nie wykonała jeszcze obsługiwanego testu d20.",
    "roll.alreadyUsed":
      "Do tego rzutu wykorzystano już Desperate Measure.",
    "roll.tooOld":
      "Ostatni test jest zbyt stary. Wykonaj nowy test d20.",
    "roll.noMessage":
      "Nie znaleziono wiadomości czatu powiązanej z ostatnim rzutem.",
    "roll.messageUnavailable":
      "Wiadomość ostatniego rzutu nie jest już dostępna.",
    "roll.noAttack": "Postać nie wykonała jeszcze rzutu ataku.",
    "roll.notAttack": "Ostatni przechwycony rzut nie jest rzutem ataku.",
    "roll.attackTooOld":
      "Ostatni atak jest zbyt stary. Wykonaj nowy rzut ataku.",
    "roll.noAttackMessage":
      "Nie znaleziono wiadomości czatu powiązanej z ostatnim atakiem.",
    "roll.attackMessageUnavailable":
      "Wiadomość ostatniego ataku nie jest już dostępna.",
    "roll.plusFiveError":
      "Nie udało się dodać +5 do ostatniego rzutu. Sprawdź konsolę.",
    "roll.rerollError":
      "Nie udało się przerzucić ostatniego ataku. Sprawdź konsolę.",
    "roll.rerollFlavor": "Desperate Measures — przerzut ataku",
    "roll.replacedStatus":
      "Ten rzut został zastąpiony przez Desperate Measures.",

    "slots.missingActorOrEffect":
      "Nie znaleziono postaci lub oczekującego efektu.",
    "slots.chooseLevel":
      "Wybierz poziom slotu zaklęcia, który chcesz odzyskać.",
    "slots.noSlotsAtLevel": "Postać nie posiada slotów tego poziomu.",
    "slots.fullAtLevel": "Sloty tego poziomu są już pełne.",
    "slots.level": "Poziom {level}",
    "slots.missing": "Brakuje: {count}",
    "slots.recoverTitle": "Odzyskaj slot zaklęcia — {actor}",
    "slots.cancel": "Anuluj",
    "slots.levelNotFound": "Nie znaleziono wybranego poziomu slotu.",
    "slots.characterHasNone":
      "Postać nie posiada slotów {level}. poziomu.",
    "slots.alreadyFull": "Sloty {level}. poziomu są już pełne.",
    "slots.recovered": "{actor} odzyskuje slot {level}. poziomu.",
    "slots.chatRecovered":
      "{actor} odzyskuje slot zaklęcia {level}. poziomu.",
    "slots.chatSlots": "Sloty",

    "rest.reset":
      "{actor}: Desperate Measures zostały zresetowane po długim odpoczynku."
  }
};

export function getModuleLanguage() {
  try {
    return game.settings.get(
      MODULE_ID,
      SETTINGS.LANGUAGE
    ) === "pl"
      ? "pl"
      : "en";
  } catch (_error) {
    return "en";
  }
}

export function t(key, replacements = {}) {
  const language = getModuleLanguage();

  let text =
    TRANSLATIONS[language]?.[key] ??
    TRANSLATIONS.en[key] ??
    key;

  for (const [name, value] of Object.entries(replacements)) {
    text = text.replaceAll(
      `{${name}}`,
      String(value)
    );
  }

  return text;
}

export function deathSaveFailureLabel(count) {
  return t(
    Number(count) === 1
      ? "common.deathSaveFailure.one"
      : "common.deathSaveFailure.many"
  );
}