import { SpellSlotManager }
  from "../managers/SpellSlotManager.js";

import { DesperateManager }
  from "../managers/DesperateManager.js";

export class SpellSlotDialog {
  static async open(actor, pendingEffect) {
    if (!actor || !pendingEffect) {
      ui.notifications.warn(
        "Nie znaleziono postaci lub oczekującego efektu."
      );

      return;
    }

    const slots =
      SpellSlotManager.getAvailableSlots(actor);

    const content = `
      <div class="desperate-slot-dialog">
        <p>
          Wybierz poziom slotu zaklęcia, który chcesz odzyskać.
        </p>

        <div class="desperate-slot-list">
          ${slots
            .map((slot) => {
              const disabled =
                !slot.canRecover;

              let reason = "";

              if (slot.maximum <= 0) {
                reason =
                  "Postać nie posiada slotów tego poziomu.";
              } else if (!slot.canRecover) {
                reason =
                  "Sloty tego poziomu są już pełne.";
              }

              return `
                <button
                  type="button"
                  class="desperate-slot-choice"
                  data-slot-level="${slot.level}"
                  ${disabled ? "disabled" : ""}
                  title="${reason}"
                >
                  <span class="desperate-slot-level">
                    Poziom ${slot.level}
                  </span>

                  <span class="desperate-slot-values">
                    ${slot.value} / ${slot.maximum}
                  </span>

                  <small>
                    ${
                      slot.canRecover
                        ? `Brakuje: ${slot.missing}`
                        : reason
                    }
                  </small>
                </button>
              `;
            })
            .join("")}
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title:
        `Odzyskaj slot zaklęcia — ${actor.name}`,

      content,

      buttons: {
        close: {
          icon:
            '<i class="fa-solid fa-xmark"></i>',
          label: "Anuluj"
        }
      },

      default: "close",

      render: (html) => {
        this.activateListeners(
          dialog,
          actor,
          pendingEffect,
          html
        );
      }
    });

    dialog.render(true);
  }

  static activateListeners(
    dialog,
    actor,
    pendingEffect,
    html
  ) {
    const root =
      html instanceof HTMLElement
        ? html
        : html?.[0];

    if (!root) return;

    const buttons = root.querySelectorAll(
      ".desperate-slot-choice"
    );

    for (const button of buttons) {
      button.addEventListener(
        "click",
        async () => {
          const level = Number(
            button.dataset.slotLevel
          );

          button.disabled = true;

          const recovery =
            await SpellSlotManager.recoverSlot(
              actor,
              level
            );

          if (!recovery) {
            button.disabled = false;
            return;
          }

          await DesperateManager.removePendingEffect(
            actor,
            pendingEffect.id
          );

          await SpellSlotManager.createRecoveryMessage(
            actor,
            recovery
          );

          ui.notifications.info(
            `${actor.name} odzyskuje slot ${level}. poziomu.`
          );

          await dialog.close();
        }
      );
    }
  }
}