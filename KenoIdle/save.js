function saveGame() {
  const save = {
    playerMoney,
    upgrades,
    gameState,
    settings,
  };
  localStorage.setItem("kenoSave", JSON.stringify(save));
}

function loadGame() {
  console.log("Loaded save:", data);

  const raw = localStorage.getItem("kenoSave");
  if (!raw) return;

  const data = JSON.parse(raw);

  if (typeof data.playerMoney === "number") {
    playerMoney = data.playerMoney;
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

  applyUpgrades();
  applySoundSettings();
  updateMoneyDisplay();
}



function hardReset() { // just for debugging tests
  localStorage.removeItem("kenoSave");
  location.reload();
}