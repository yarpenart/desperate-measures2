import { DesperateManager }
  from "../managers/DesperateManager.js";

export class DesperateDialog {
  static open(actor) {
    if (!actor) {
      ui.notifications.warn(
        "Nie znaleziono postaci."
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
          label: "Zamknij"
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
                Koszt: ${cost}
                ${
                  Number(cost) === 1
                    ? "porażka"
                    : "porażki"
                }
                death save
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
            HP:
            ${actor.system.attributes.hp.value}
            /
            ${actor.system.attributes.hp.max}
          </span>

          <span>
            Death Saves:
            ${"☠".repeat(failures)}
            ${"○".repeat(3 - failures)}
          </span>
        </div>

        <p class="desperate-measures-dialog-warning">
          Wybranie opcji natychmiast zaznaczy jej koszt
          jako niezdane death save’y.
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
      title: "Potwierdź Desperate Measure",

      content: `
        <div class="desperate-measures-confirm">
          <p>
            Czy na pewno chcesz użyć:
          </p>

          <h2>${measure.name}</h2>

          <p>${measure.description}</p>

          <p>
            Koszt:
            <strong>
              ${measure.cost}
              ${
                measure.cost === 1
                  ? "porażka"
                  : "porażki"
              }
              death save
            </strong>
          </p>

          <p class="desperate-measures-confirm-warning">
            Te pola zostaną zaznaczone natychmiast.
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
  }
}