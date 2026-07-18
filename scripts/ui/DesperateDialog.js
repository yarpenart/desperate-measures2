import { DesperateManager }
  from "../managers/DesperateManager.js";

import { SpellSlotDialog }
  from "./SpellSlotDialog.js";

import {
  MEASURE_IDS
} from "../constants/constants.js";

import {
  t,
  deathSaveFailureLabel
} from "../i18n.js";

export class DesperateDialog {
  static open(actor) {
    if (!actor) {
      ui.notifications.warn(
        t("dialog.characterNotFound")
      );

      return;
    }

    const failures =
      DesperateManager.getFailures(actor);

    const content =
      this.createDialogContent(actor, failures);

    const dialog = new Dialog({
      title: `Desperate Measures — ${actor.name}`,

      content,

      buttons: {
        close: {
          icon: '<i class="fa-solid fa-xmark"></i>',
          label: t("dialog.close")
        }
      },

      default: "close",

      render: (html) => {
        this.activateListeners(
          dialog,
          actor,
          html
        );
      }
    });

    dialog.render(true);
  }

  static createDialogContent(actor, failures) {
    const measures = Object.values(
      DesperateManager.MEASURES
    );

    const groups = {
      1: measures.filter(
        (measure) => measure.cost === 1
      ),

      2: measures.filter(
        (measure) => measure.cost === 2
      ),

      3: measures.filter(
        (measure) => measure.cost === 3
      )
    };

    const sections = Object.entries(groups)
      .map(([cost, options]) => {
        const cards = options
          .map((measure) => {
            const validation =
              DesperateManager.canUseMeasure(
                actor,
                measure.id
              );

            return `
              <button
                type="button"
                class="desperate-measure-choice"
                data-measure-id="${measure.id}"
                ${validation.allowed ? "" : "disabled"}
                title="${
                  validation.allowed
                    ? measure.description
                    : validation.reason
                }"
              >
                <span class="desperate-measure-choice-icon">
                  <i class="fa-solid ${measure.icon}"></i>
                </span>

                <span class="desperate-measure-choice-text">
                  <strong>${measure.name}</strong>
                  <small>${measure.description}</small>
                </span>
              </button>
            `;
          })
          .join("");

        return `
          <section class="desperate-measure-tier">
            <header>
              <span>
                ${t("common.cost")}:
                ${cost}
                ${deathSaveFailureLabel(cost)}
              </span>

              <span>
                ${"☠".repeat(Number(cost))}
              </span>
            </header>

            <div class="desperate-measure-options">
              ${cards}
            </div>
          </section>
        `;
      })
      .join("");

    return `
      <div class="desperate-measures-dialog">
        <div class="desperate-measures-dialog-summary">
          <span>
            <strong>${actor.name}</strong>
          </span>

          <span>
            ${t("common.hp")}:
            ${actor.system.attributes.hp.value}
            /
            ${actor.system.attributes.hp.max}
          </span>

          <span>
            ${t("dialog.deathSaves")}:
            ${"☠".repeat(failures)}
            ${"○".repeat(3 - failures)}
          </span>
        </div>

        <p class="desperate-measures-dialog-warning">
          ${t("dialog.selectionWarning")}
        </p>

        ${sections}
      </div>
    `;
  }

  static activateListeners(dialog, actor, html) {
    const root =
      html instanceof HTMLElement
        ? html
        : html?.[0];

    if (!root) return;

    const buttons = root.querySelectorAll(
      ".desperate-measure-choice"
    );

    for (const button of buttons) {
      button.addEventListener(
        "click",
        async () => {
          const measureId =
            button.dataset.measureId;

          await this.confirmUse(
            dialog,
            actor,
            measureId
          );
        }
      );
    }
  }

  static async confirmUse(
    parentDialog,
    actor,
    measureId
  ) {
    const measure =
      DesperateManager.getMeasure(measureId);

    if (!measure) return;

    const confirmed = await Dialog.confirm({
      title: t("dialog.confirmTitle"),

      content: `
        <div class="desperate-measures-confirm">
          <p>
            ${t("dialog.confirmQuestion")}
          </p>

          <h2>${measure.name}</h2>

          <p>${measure.description}</p>

          <p>
            ${t("common.cost")}:
            <strong>
              ${measure.cost}
              ${deathSaveFailureLabel(measure.cost)}
            </strong>
          </p>

          <p class="desperate-measures-confirm-warning">
            ${t("dialog.confirmWarning")}
          </p>
        </div>
      `,

      yes: () => true,
      no: () => false,

      defaultYes: false
    });

    if (!confirmed) return;

    const result =
      await DesperateManager.useMeasure(
        actor,
        measureId
      );

    if (!result) return;

    await parentDialog.close();

    if (
      measureId ===
      MEASURE_IDS.RECOVER_SPELL_SLOT
    ) {
      await SpellSlotDialog.open(
        actor,
        result.pendingEffect
      );
    }
  }
}