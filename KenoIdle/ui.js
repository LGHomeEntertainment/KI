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

function updateStatsDisplay() {
  let runtimeSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
  let runtimeMinutes = (runtimeSeconds / 60).toFixed(1)

  let winRate = gameState.totalRounds > 0 ? ((gameState.totalWins / gameState.totalRounds) * 100).toFixed(1) : 0;

  let avgProfit = gameState.totalRounds > 0 ? (gameState.totalProfit / gameState.totalRounds).toFixed(2) : 0;

  console.log(`
  ==== STATS ====
  Rounds: ${gameState.totalRounds}
  Wins: ${gameState.totalWins}
  Win Rate: ${winRate}%
  Avg Profit: ${avgProfit}
  Total Profit: ${gameState.totalProfit.toLocaleString()}
  Runtime: ${runtimeMinutes} min
  ========
  `);
}
                              

