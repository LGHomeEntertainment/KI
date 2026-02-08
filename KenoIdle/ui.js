// ==== UI + INTERACTION ====

function attachListeners() {
  // Player cells
  document.getElementById("table").addEventListener("click", (e) => {
  if (!e.target.classList.contains("cell") || gameRunning) return;
  toggleCell(e);
});
  document.getElementById("debugResetBtn").addEventListener("click", hardReset);


  // Play + clear
  document.getElementById("playBtn").addEventListener("click", () => {
    if (gameRunning) return; // prevent spam-click start
    startGameLoop();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (gameRunning) return;
    clearPicks();
  });
}

function updateMoneyDisplay() {
  document.getElementById("moneyDisplay").textContent =
    `$${playerMoney.toLocaleString()}`;
}



