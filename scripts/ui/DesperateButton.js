import { BloodiedManager }
  from "../managers/BloodiedManager.js";

import { DesperateManager }
  from "../managers/DesperateManager.js";

import { DesperateDialog }
  from "./DesperateDialog.js";

import { t }
  from "../i18n.js";

export class DesperateButton {
  static createButton(app, html) {
    const actor =
      app.actor ??
      app.document ??
      app.object;

    if (!actor) return;
    if (actor.documentName !== "Actor") return;
    if (actor.type !== "character") return;

    const mayView =
      game.user.isGM ||
      actor.isOwner;

    if (!mayView) return;

    const root = this.getRootElement(html, app);
    if (!root) {
      console.warn(
        "Desperate Measures | Nie znaleziono HTML karty aktora."
      );

      return;
    }

    root
      .querySelectorAll(".desperate-measures-panel")
      .forEach((element) => element.remove());

    const failures =
      DesperateManager.getFailures(actor);

    const bloodied =
      BloodiedManager.isBloodied(actor);

    const panel = document.createElement("section");

    panel.classList.add(
      "desperate-measures-panel"
    );

    panel.innerHTML = `
      <header class="desperate-measures-header">
        <i class="fa-solid fa-heart-crack"></i>

        <span>Desperate Measures</span>
      </header>

      <div class="desperate-measures-status">
        <span>
          ${t("button.status")}:
          <strong class="${bloodied ? "is-bloodied" : ""}">
            ${
              bloodied
                ? t("button.bloodied")
                : t("button.unavailable")
            }
          </strong>
        </span>

        <span>
          ${t("common.hp")}:
          ${actor.system.attributes.hp.value}
          /
          ${actor.system.attributes.hp.max}
        </span>
      </div>

      <div class="desperate-measures-failures">
        <span>${t("button.deathSaveFailures")}:</span>

        <span
          class="desperate-measures-skulls"
          aria-label="${t("button.failuresAria", {
            count: failures
          })}"
        >
          ${this.createFailureDisplay(failures)}
        </span>
      </div>

      <button
        type="button"
        class="desperate-measures-open"
        ${bloodied && failures < 3 ? "" : "disabled"}
      >
        <i class="fa-solid fa-fire"></i>
        ${t("button.use")}
      </button>

      <p class="desperate-measures-hint">
        ${
          bloodied
            ? failures < 3
              ? t("button.hint.available")
              : t("button.hint.maxFailures")
            : t("button.hint.hp")
        }
      </p>
    `;

    panel
      .querySelector(".desperate-measures-open")
      ?.addEventListener("click", () => {
        DesperateDialog.open(actor);
      });

    const insertionPoint =
      root.querySelector("form") ??
      root.querySelector(".window-content") ??
      root;

    insertionPoint.append(panel);

    console.log(
      `Desperate Measures | Dodano panel do karty: ${actor.name}`
    );
  }

  static getRootElement(html, app) {
    if (html instanceof HTMLElement) {
      return html;
    }

    if (html?.[0] instanceof HTMLElement) {
      return html[0];
    }

    if (app.element instanceof HTMLElement) {
      return app.element;
    }

    if (app.element?.[0] instanceof HTMLElement) {
      return app.element[0];
    }

    return null;
  }

  static createFailureDisplay(failures) {
    const skulls = [];

    for (let index = 0; index < 3; index += 1) {
      const marked = index < failures;

      skulls.push(`
        <i
          class="fa-solid ${marked ? "fa-skull" : "fa-circle"}"
          data-marked="${marked}"
        ></i>
      `);
    }

    return skulls.join("");
  }
}