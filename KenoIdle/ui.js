// ==== UI + INTERACTION ====

// function disableInputs() {
//   document.getElementById("clearBtn").removeEventListener("click", clearPicks);

//   document.querySelectorAll(".cell").forEach((cell) => {
//     cell.removeEventListener("click", toggleCell);
//   });
// }

// function enableInputs() {
//     document.getElementById("clearBtn").addEventListener("click", clearPicks);

//   document.querySelectorAll(".cell").forEach((cell) => {
//     cell.addEventListener("click", toggleCell);
//   });
// }


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



