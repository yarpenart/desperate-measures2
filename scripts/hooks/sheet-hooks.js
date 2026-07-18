import { DesperateButton }
  from "../ui/DesperateButton.js";

import { MODULE_ID }
  from "../constants/constants.js";

export function registerSheetHooks() {
  Hooks.on(
    "renderActorSheetV2",
    renderDesperatePanel
  );

  Hooks.on(
    "renderActorSheet",
    renderDesperatePanel
  );
}

function renderDesperatePanel(app, html) {
  try {
    DesperateButton.createButton(
      app,
      html
    );
  } catch (error) {
    console.error(
      `${MODULE_ID} | Nie udało się dodać panelu do karty aktora.`,
      error
    );
  }
}