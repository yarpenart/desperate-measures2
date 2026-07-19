import {
  MODULE_ID,
  MODULE_NAME,
  SETTINGS
} from "../constants/constants.js";

import { getModuleLanguage }
  from "../i18n.js";

const JOURNAL_FLAG = "rulesReference";
const PAGE_FLAG = "rulesPage";
const CONTENT_VERSION = 1;

let refreshTimer = null;

export class RulesJournal {
  static getPrimaryGM() {
    return game.users
      .filter((user) => user.active && user.isGM)
      .sort((left, right) =>
        left.id.localeCompare(right.id)
      )[0] ?? null;
  }

  static isPrimaryGM() {
    return Boolean(
      game.user.isGM &&
      this.getPrimaryGM()?.id === game.user.id
    );
  }

  static getConfiguration() {
    return {
      language: getModuleLanguage(),
      bloodiedThreshold: Number(
        game.settings.get(
          MODULE_ID,
          SETTINGS.BLOODIED_THRESHOLD
        )
      ),
      allowZeroHP: Boolean(
        game.settings.get(
          MODULE_ID,
          SETTINGS.ALLOW_ZERO_HP
        )
      ),
      requireCombat: Boolean(
        game.settings.get(
          MODULE_ID,
          SETTINGS.REQUIRE_COMBAT
        )
      ),
      resetOnLongRest: Boolean(
        game.settings.get(
          MODULE_ID,
          SETTINGS.RESET_ON_LONG_REST
        )
      ),
      showChatMessages: Boolean(
        game.settings.get(
          MODULE_ID,
          SETTINGS.SHOW_CHAT_MESSAGES
        )
      )
    };
  }

  static getJournalName(language) {
    return language === "pl"
      ? "Desperate Measures — Ściąga z zasad"
      : "Desperate Measures — Rules Reference";
  }

  static getPageName(language) {
    return language === "pl"
      ? "Desperate Measures — zasady"
      : "Desperate Measures — Rules";
  }

  static getContent(configuration) {
    return configuration.language === "pl"
      ? this.getPolishContent(configuration)
      : this.getEnglishContent(configuration);
  }

  static getEnglishContent(configuration) {
    const zeroHP = configuration.allowZeroHP
      ? "allowed"
      : "not allowed";
    const combat = configuration.requireCombat
      ? "required"
      : "not required";
    const reset = configuration.resetOnLongRest
      ? "enabled"
      : "disabled";
    const chat = configuration.showChatMessages
      ? "enabled"
      : "disabled";

    return `
      <article class="desperate-measures-rules">
        <h1>Desperate Measures</h1>
        <p class="desperate-rules-lead">When survival is uncertain, a Bloodied character may accept failed death saves to force one final advantage. These are real failed death-save boxes, not a separate resource.</p>

        <section>
          <h2>Current world rules</h2>
          <table>
            <tbody>
              <tr><th>Bloodied threshold</th><td><strong>${configuration.bloodiedThreshold}% of maximum HP or lower</strong></td></tr>
              <tr><th>Use at 0 HP</th><td>${zeroHP}</td></tr>
              <tr><th>Active combat</th><td>${combat}</td></tr>
              <tr><th>Reset on a long rest</th><td>${reset}</td></tr>
              <tr><th>Private chat reports to owner and GM</th><td>${chat}</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>When and how to use a Desperate Measure</h2>
          <ol>
            <li>Your character must meet the current Bloodied, 0 HP and combat requirements shown above.</li>
            <li>You must have enough empty failed death-save boxes to pay the entire cost. A character can never exceed three marked failures.</li>
            <li>For a roll-based option, make the relevant d20 roll first. The module remembers supported rolls for two minutes.</li>
            <li>Open the Desperate Measures panel on your character sheet, select an available option and confirm it.</li>
            <li>The cost is marked immediately as failed death saves. The choice cannot be taken back through the dialog.</li>
            <li>Resolve the benefit below. Some action benefits are permissions that the player and GM apply manually.</li>
          </ol>
          <div class="desperate-rules-warning"><strong>Risk:</strong> reaching three failed death saves uses the character's normal death-save track and may have the campaign's normal consequences. Confirm the risk with the GM before spending the boxes.</div>
        </section>

        <section>
          <h2>Cost: 1 failed death save</h2>
          <h3><i class="fa-solid fa-person-running"></i> Dash + Disengage</h3>
          <p>Immediately take both Dash and Disengage as additional actions. The module records the choice; movement and action resolution are handled manually.</p>

          <h3><i class="fa-solid fa-dice-d20"></i> +5 to a failed check</h3>
          <p>Add +5 to the most recent supported d20 roll: an ability check, saving throw, skill check, tool check or attack roll.</p>
          <ul>
            <li>The roll must be no more than two minutes old and its chat message must still exist.</li>
            <li>The module changes the original roll total in its chat message.</li>
            <li>The module does not decide whether the original roll failed; the player and GM make that judgment.</li>
            <li>The same captured roll cannot be used again for another roll-based Desperate Measure.</li>
          </ul>

          <h3><i class="fa-solid fa-rotate"></i> Reroll a failed attack</h3>
          <p>Reroll the most recent attack roll and use the new result.</p>
          <ul>
            <li>The attack must be no more than two minutes old and its chat message must still exist.</li>
            <li>The new roll respects the original message visibility. The previous message is marked as replaced.</li>
            <li>The module does not decide whether the original attack missed.</li>
          </ul>
        </section>

        <section>
          <h2>Cost: 2 failed death saves</h2>
          <h3><i class="fa-solid fa-burst"></i> Maximum damage</h3>
          <p>After an attack roll, declare Maximum Damage. If that attack hits, every die in the associated damage roll produces its maximum value.</p>
          <ul>
            <li>The triggering attack must be no more than two minutes old and unused by another roll-based Desperate Measure.</li>
            <li>Roll damage within three minutes and before making another attack. A new attack clears the pending benefit.</li>
            <li>The effect maximizes damage dice; flat modifiers are added normally.</li>
            <li>If the attack misses, the cost remains paid.</li>
          </ul>
        </section>

        <section>
          <h2>Cost: 3 failed death saves</h2>
          <h3><i class="fa-solid fa-bolt"></i> Additional Attack or Magic action</h3>
          <p>Immediately take one additional Attack or Magic action. The module records the choice; the action is resolved manually.</p>

          <h3><i class="fa-solid fa-wand-magic-sparkles"></i> Recover a spell slot</h3>
          <p>Recover one expended spell slot of level 1 through 5.</p>
          <ul>
            <li>The character must possess an expended slot in that range.</li>
            <li>After confirmation, choose the slot level in the recovery dialog.</li>
            <li>One slot is restored, never above that level's normal maximum.</li>
          </ul>
        </section>

        <section>
          <h2>Reset and bookkeeping</h2>
          <ul>
            <li>When long-rest reset is enabled, a completed long rest clears failed death saves, stored rolls and pending Desperate Measures effects.</li>
            <li>When it is disabled, the GM decides when those resources reset.</li>
            <li>The character-sheet skulls show the current number of marked failures: ☠☠☠.</li>
            <li>Chat reports, when enabled, are whispered to the character's owners and the GM.</li>
          </ul>
        </section>
      </article>`;
  }

  static getPolishContent(configuration) {
    const zeroHP = configuration.allowZeroHP
      ? "dozwolone"
      : "niedozwolone";
    const combat = configuration.requireCombat
      ? "wymagana"
      : "niewymagana";
    const reset = configuration.resetOnLongRest
      ? "włączony"
      : "wyłączony";
    const chat = configuration.showChatMessages
      ? "włączone"
      : "wyłączone";

    return `
      <article class="desperate-measures-rules">
        <h1>Desperate Measures</h1>
        <p class="desperate-rules-lead">Gdy przetrwanie stoi pod znakiem zapytania, postać ze statusem Bloodied może przyjąć porażki death save, aby zdobyć ostatnią przewagę. Są to prawdziwe pola niezdanych death save’ów, a nie oddzielny zasób.</p>

        <section>
          <h2>Aktualne zasady świata</h2>
          <table>
            <tbody>
              <tr><th>Próg Bloodied</th><td><strong>${configuration.bloodiedThreshold}% maksymalnych HP lub mniej</strong></td></tr>
              <tr><th>Użycie przy 0 HP</th><td>${zeroHP}</td></tr>
              <tr><th>Aktywna walka</th><td>${combat}</td></tr>
              <tr><th>Reset po długim odpoczynku</th><td>${reset}</td></tr>
              <tr><th>Prywatne raporty czatu dla właściciela i GM-a</th><td>${chat}</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>Kiedy i jak użyć Desperate Measure</h2>
          <ol>
            <li>Postać musi spełniać pokazane wyżej wymagania dotyczące Bloodied, 0 HP i aktywnej walki.</li>
            <li>Musisz mieć wystarczająco dużo pustych pól niezdanych death save’ów, aby zapłacić pełny koszt. Postać nigdy nie może przekroczyć trzech porażek.</li>
            <li>Przy opcji reagującej na rzut najpierw wykonaj odpowiedni rzut d20. Moduł pamięta obsługiwane rzuty przez dwie minuty.</li>
            <li>Otwórz panel Desperate Measures na karcie postaci, wybierz dostępną opcję i ją potwierdź.</li>
            <li>Koszt jest natychmiast zaznaczany jako niezdane death save’y. Wyboru nie można cofnąć w oknie modułu.</li>
            <li>Rozpatrz opisany niżej efekt. Część korzyści związanych z akcjami gracz i GM stosują ręcznie.</li>
          </ol>
          <div class="desperate-rules-warning"><strong>Ryzyko:</strong> osiągnięcie trzech niezdanych death save’ów korzysta ze zwykłego toru śmierci postaci i może mieć normalne konsekwencje kampanii. Przed wydaniem pól potwierdź ryzyko z GM-em.</div>
        </section>

        <section>
          <h2>Koszt: 1 niezdany death save</h2>
          <h3><i class="fa-solid fa-person-running"></i> Dash + Disengage</h3>
          <p>Natychmiast wykonaj Dash i Disengage jako dodatkowe akcje. Moduł zapisuje wybór; ruch i akcje są rozpatrywane ręcznie.</p>

          <h3><i class="fa-solid fa-dice-d20"></i> +5 do nieudanego testu</h3>
          <p>Dodaj +5 do ostatniego obsługiwanego rzutu d20: testu cechy, rzutu obronnego, testu umiejętności, testu narzędzia albo rzutu ataku.</p>
          <ul>
            <li>Rzut nie może być starszy niż dwie minuty, a jego wiadomość musi nadal istnieć na czacie.</li>
            <li>Moduł zmienia wynik pierwotnego rzutu w jego wiadomości.</li>
            <li>Moduł nie rozpoznaje, czy pierwotny rzut był porażką — oceniają to gracz i GM.</li>
            <li>Tego samego zapisanego rzutu nie można ponownie wykorzystać do innej Desperate Measure związanej z rzutem.</li>
          </ul>

          <h3><i class="fa-solid fa-rotate"></i> Przerzut nieudanego ataku</h3>
          <p>Przerzuć ostatni rzut ataku i użyj nowego wyniku.</p>
          <ul>
            <li>Atak nie może być starszy niż dwie minuty, a jego wiadomość musi nadal istnieć na czacie.</li>
            <li>Nowy rzut respektuje widoczność pierwotnej wiadomości. Poprzednia wiadomość zostaje oznaczona jako zastąpiona.</li>
            <li>Moduł nie rozpoznaje automatycznie, czy pierwotny atak chybił.</li>
          </ul>
        </section>

        <section>
          <h2>Koszt: 2 niezdane death save’y</h2>
          <h3><i class="fa-solid fa-burst"></i> Maksymalne obrażenia</h3>
          <p>Po rzucie ataku zadeklaruj maksymalne obrażenia. Jeżeli ten atak trafi, każda kość powiązanego rzutu obrażeń osiąga swoją maksymalną wartość.</p>
          <ul>
            <li>Atak wywołujący efekt nie może być starszy niż dwie minuty ani wykorzystany przez inną Desperate Measure związaną z rzutem.</li>
            <li>Rzuć obrażenia w ciągu trzech minut i przed wykonaniem następnego ataku. Nowy atak usuwa oczekującą korzyść.</li>
            <li>Efekt maksymalizuje kości obrażeń; stałe modyfikatory są dodawane normalnie.</li>
            <li>Jeżeli atak chybi, koszt pozostaje zapłacony.</li>
          </ul>
        </section>

        <section>
          <h2>Koszt: 3 niezdane death save’y</h2>
          <h3><i class="fa-solid fa-bolt"></i> Dodatkowa akcja Attack lub Magic</h3>
          <p>Natychmiast wykonaj jedną dodatkową akcję Attack albo Magic. Moduł zapisuje wybór; akcja jest rozpatrywana ręcznie.</p>

          <h3><i class="fa-solid fa-wand-magic-sparkles"></i> Odzyskaj slot zaklęcia</h3>
          <p>Odzyskaj jeden zużyty slot zaklęcia poziomu od 1 do 5.</p>
          <ul>
            <li>Postać musi posiadać zużyty slot w tym zakresie.</li>
            <li>Po potwierdzeniu wybierz poziom slotu w oknie odzyskiwania.</li>
            <li>Odzyskiwany jest jeden slot, nigdy powyżej zwykłego maksimum danego poziomu.</li>
          </ul>
        </section>

        <section>
          <h2>Reset i śledzenie zasobów</h2>
          <ul>
            <li>Gdy reset po długim odpoczynku jest włączony, ukończenie długiego odpoczynku usuwa niezdane death save’y, zapisane rzuty i oczekujące efekty Desperate Measures.</li>
            <li>Gdy jest wyłączony, GM decyduje, kiedy te zasoby są resetowane.</li>
            <li>Czaszki na karcie postaci pokazują aktualną liczbę zaznaczonych porażek: ☠☠☠.</li>
            <li>Raporty czatu, gdy są włączone, są wysyłane prywatnie do właścicieli postaci oraz GM-a.</li>
          </ul>
        </section>
      </article>`;
  }

  static getSignature(configuration) {
    return JSON.stringify(configuration);
  }

  static getPageData(configuration) {
    const signature = this.getSignature(configuration);

    return {
      name: this.getPageName(
        configuration.language
      ),
      type: "text",
      sort: 100000,
      ownership: {
        default:
          CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
      },
      text: {
        content: this.getContent(configuration),
        format:
          CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
      },
      flags: {
        [MODULE_ID]: {
          [PAGE_FLAG]: true,
          contentVersion: CONTENT_VERSION,
          configurationSignature: signature
        }
      }
    };
  }

  static async ensure() {
    if (!this.isPrimaryGM()) return null;

    const configuration =
      this.getConfiguration();
    const signature =
      this.getSignature(configuration);

    let journal = game.journal.find(
      (entry) => entry.getFlag(
        MODULE_ID,
        JOURNAL_FLAG
      )
    );

    if (!journal) {
      journal = await JournalEntry.create({
        name: this.getJournalName(
          configuration.language
        ),
        ownership: {
          default:
            CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
        },
        flags: {
          [MODULE_ID]: {
            [JOURNAL_FLAG]: true,
            contentVersion: CONTENT_VERSION,
            language: configuration.language
          }
        }
      });

      if (!journal) return null;
    }

    const page = journal.pages.find(
      (candidate) => candidate.getFlag(
        MODULE_ID,
        PAGE_FLAG
      )
    );

    if (!page) {
      await journal.createEmbeddedDocuments(
        "JournalEntryPage",
        [this.getPageData(configuration)]
      );
    } else {
      const currentVersion = Number(
        page.getFlag(
          MODULE_ID,
          "contentVersion"
        ) ?? 0
      );
      const currentSignature = String(
        page.getFlag(
          MODULE_ID,
          "configurationSignature"
        ) ?? ""
      );

      if (
        currentVersion !== CONTENT_VERSION ||
        currentSignature !== signature
      ) {
        await page.update(
          this.getPageData(configuration)
        );
      }
    }

    const storedLanguage = journal.getFlag(
      MODULE_ID,
      "language"
    );
    const storedVersion = Number(
      journal.getFlag(
        MODULE_ID,
        "contentVersion"
      ) ?? 0
    );

    if (
      storedLanguage !== configuration.language ||
      storedVersion !== CONTENT_VERSION
    ) {
      await journal.update({
        name: this.getJournalName(
          configuration.language
        ),
        [`flags.${MODULE_ID}.language`]:
          configuration.language,
        [`flags.${MODULE_ID}.contentVersion`]:
          CONTENT_VERSION
      });
    }

    return journal;
  }

  static scheduleRefresh() {
    if (!this.isPrimaryGM()) return;

    if (refreshTimer !== null) {
      window.clearTimeout(refreshTimer);
    }

    refreshTimer = window.setTimeout(() => {
      refreshTimer = null;

      void this.ensure().catch((error) => {
        console.error(
          `${MODULE_NAME} | Rules journal refresh failed`,
          error
        );
      });
    }, 250);
  }

  static async initialize() {
    Hooks.on("updateSetting", (setting) => {
      if (
        !String(setting?.key ?? "").startsWith(
          `${MODULE_ID}.`
        )
      ) {
        return;
      }

      this.scheduleRefresh();
    });

    return this.ensure();
  }
}
