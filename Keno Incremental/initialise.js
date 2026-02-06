// ==== INITIALISATION + GENERATION OF STUFF ====
document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  loadGame();
  generateGrid(boardSize);
  attachListeners();
  updateMoneyDisplay();
}

function generateGrid(boardSize) {
  let table = document.getElementById("table");
  table.innerHTML = "";

  for (let i = 1; i <= boardSize; i++) {
    const td = document.createElement("div");
    // const td = document.createElement("td")
    td.className = "cell";
    td.id = "cell" + i;
    td.textContent = i;
    table.appendChild(td);
  }
  enableInputs();
}

