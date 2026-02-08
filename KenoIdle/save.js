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
  const raw = localStorage.getItem("kenoSave");
  if (!raw) return;

  const data = JSON.parse(raw);

Object.assign(gameState.currency, data.currency ?? {})
Object.assign(gameState.upgrades, data.upgrades ?? {})

  applyUpgrades()
  applySoundSettings(); // restore audio state

  updateMoneyDisplay();
}


function hardReset() { // just for debugging tests
  localStorage.removeItem("kenoSave");
  location.reload();
}