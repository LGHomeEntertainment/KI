function saveGame() {
  localStorage.setItem("KenoIncrementalSave", JSON.stringify(gameState));
}


function loadGame() {
  const raw = localStorage.getItem("KenoIncrementalSave");
  if (!raw) return;

  const data = JSON.parse(raw);

Object.assign(gameState.currency, data.currency ?? {})
Object.assign(gameState.upgrades, data.upgrades ?? {})

  applyUpgrades()
//  generategrid(boardSize)
  updateMoneyDisplay();
}


function hardReset() { // just for debugging tests
  localStorage.removeItem("KenoIncrementalSave");
  location.reload();
}