
// ==== INITIALISATION + GENERATION OF STUFF ====

document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  loadGame();                // data only
  generateGrid(boardSize);   // DOM creation
  attachListeners();         // UI wiring
  applySoundSettings();      // depends on settings
  updateMoneyDisplay();
  setInterval(saveGame, 20000);
}

function generateGrid(boardSize) {
  let table = document.getElementById("table");
  table.innerHTML = "";

  for (let i = 1; i <= boardSize; i++) {
    const td = document.createElement("div");
    td.className = "cell";
    td.id = "cell" + i;
    td.textContent = i;
    table.appendChild(td);
  }
  // enableInputs();
}










// Does it calculate money? → payout.js

// Does it control time / rounds? → game.js

// Does it read or write DOM? → ui.js

// Is it data? → globals.js

// Is it permanent? → save.js