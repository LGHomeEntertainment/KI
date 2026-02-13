function saveGame() {
  const save = {
    currency,
    upgrades,
    gameState,
    settings,
  };
  localStorage.setItem("kenoSave", JSON.stringify(save));
  console.log("Autosaved at", new Date().toLocaleTimeString());
}

function loadGame() {
  const raw = localStorage.getItem("kenoSave");
  if (!raw) return;
  const data = JSON.parse(raw);

  if (data.currency) {
    Object.assign(currency, data.currency);
  }

  if (data.upgrades) {
    Object.assign(upgrades, data.upgrades);
  }

  if (data.gameState) {
    Object.assign(gameState, data.gameState);
  }

  if (data.settings) {
    Object.assign(settings, data.settings);
  }

  // ALWAYS reset volatile state
  gameState.running = false; // ensure game is not running on load

  console.log("Loaded save:", data);
}

function hardReset() {
  // just for debugging tests
  localStorage.removeItem("kenoSave");
  location.reload();
}
