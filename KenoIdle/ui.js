// ==== UI + INTERACTION ====

function attachListeners() {
  // Player cells
  document.getElementById("table").addEventListener("click", (e) => {
    if (!e.target.classList.contains("cell") || gameState.running) return;
    toggleCell(e);
  });
  document.getElementById("debugResetBtn").addEventListener("click", hardReset);

  // Play + clear
  document.getElementById("playBtn").addEventListener("click", () => {
    if (gameState.running) return; // prevent spam-click start
    startGameLoop();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (gameState.running) return;
    clearPicks();
  });

  document.getElementById("soundBtn").addEventListener("click", toggleSound);
}

function updateMoneyDisplay() {
  document.getElementById("moneyValue").textContent = formatNumber(currency.cash);
}

function formatNumber(num) {
  return num.toLocaleString();
}

function updateSoundButton() {
  const btn = document.getElementById("soundBtn");
  btn.textContent = settings.sound ? "🔊 Sound ON" : "🔇 Sound OFF";
}

