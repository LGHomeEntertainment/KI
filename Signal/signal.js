// ==== GLOBALs + CONSTANTS ====

let gridSize = 10; // start with 10, easier to adjust later
let totalSignals = 1;
let firstClick = true;
let board = [];
let grid = [];
// let gameOver = false;
let fadeout = 20000000;

// ==== INITIALISATION + GENERATION ====

document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  generateGrid();
  generateBoard(gridSize);
  attachListeners();
}

// visible GRID
function generateGrid() {
  grid = [];
  for (let gridRow = 0; gridRow < gridSize; gridRow++) {
    let tr = document.createElement("tr");
    for (let gridCol = 0; gridCol < gridSize; gridCol++) {
      let td = document.createElement("td");
      td.classList.add("cell");
      td.dataset.row = gridRow;
      td.dataset.col = gridCol;
      td.id = `cell-${gridRow}-${gridCol}`;
      tr.appendChild(td);
    }
    document.getElementById("grid").appendChild(tr);
  }
}

// create clear logic BOARD (the invisible one BTS)
function generateBoard(gridSize) {
  board = [];
  for (let row = 0; row < gridSize; row++) {
    let rowData = [];
    for (let col = 0; col < gridSize; col++) {
      rowData.push({
        signal: false,
        pinged: false,
        adjacent: {
          radius1: 0,
          radius2: 0,
        },
        flagged: false,
      });
    }
    board.push(rowData);
  }
}

// create the SIGNALS. put within checkanswer
function generateSignals(clickedRow, clickedCol, newSignals = totalSignals) {
  totalSignals = newSignals;
  let signalNumber = 0;
  let signalCol = 0;
  let signalRow = 0;

  while (signalNumber < totalSignals) {
    signalCol = Math.floor(Math.random() * gridSize);
    signalRow = Math.floor(Math.random() * gridSize);
    if (signalCol == clickedCol && signalRow == clickedRow) continue;
    if (
      board[signalRow][signalCol].signal == true ||
      isAdjacent(signalRow, signalCol, clickedRow, clickedCol) // if signal or if is adjacent to the cell
    )
      continue; // skip!

    board[signalRow][signalCol].signal = true; // set the signal flag
    signalNumber++;
  }

  // count adjacent once all signal placed
  // For each cell, loop through its 25 neighbors
  // If neighbor is in bounds and has a signal, increment adjacent count
  let boardCol = 0;
  let boardRow = 0;

  for (boardRow = 0; boardRow < gridSize; boardRow++) {
    for (boardCol = 0; boardCol < gridSize; boardCol++) {
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (dr == 0 && dc == 0) continue;

          let neighbourRow = boardRow + dr;
          let neighbourCol = boardCol + dc;
          if (neighbourRow < 0 || neighbourRow >= gridSize) continue;
          if (neighbourCol < 0 || neighbourCol >= gridSize) continue;
          if (board[neighbourRow][neighbourCol].signal == true) {
            if (isAdjacent(neighbourRow, neighbourCol, boardRow, boardCol)) {
              board[boardRow][boardCol].adjacent.radius1++;
            } else {
              board[boardRow][boardCol].adjacent.radius2++;
            }
          }
        }
      }
    }
  }
}

function isAdjacent(r, c, clickedRow, clickedCol) {
  // check how far apart is 2 cells (mainly for generating clear area around the first click)
  return Math.abs(r - clickedRow) <= 1 && Math.abs(c - clickedCol) <= 1;
}

// ==== GAME LOGIC ====

function handleCellClick(e) {
  let clickedCell = e.target;
  let clickedRow = parseInt(clickedCell.dataset.row);
  let clickedCol = parseInt(clickedCell.dataset.col);
  // if (gameOver) return;
  if (firstClick) {
    generateSignals(clickedRow, clickedCol);

    firstClick = false;
    getCellColour(clickedRow, clickedCol, clickedCell);
    revealArea(clickedRow, clickedCol, clickedCell);
  } else {
    getCellColour(clickedRow, clickedCol, clickedCell);
  }
}

function getCellColour(clickedRow, clickedCol, clickedCell) {
  let cellData = board[clickedRow][clickedCol];
  cellData.pinged = true; // ← Mark as pinged!

  let nearbySignals = cellData.adjacent.radius1 + cellData.adjacent.radius2;
  if (nearbySignals == 0) {
    clickedCell.classList.add("empty"); // only show empty as an aid (tentative)
  } else {
    clickedCell.textContent = nearbySignals;
    // choose colour
    if (cellData.adjacent.radius1 > 0 && cellData.adjacent.radius2 == 0) {
      clickedCell.classList.add("red");
      fadeCell(clickedCell, fadeout, ["red"], true);
    } else if (
      cellData.adjacent.radius1 == 0 &&
      cellData.adjacent.radius2 > 0
    ) {
      clickedCell.classList.add("yellow");
      fadeCell(clickedCell, fadeout, ["yellow"], true);
    } else {
      clickedCell.classList.add("orange");
      fadeCell(clickedCell, fadeout, ["orange"], true);
    }
  }
}

function revealArea(clickedRow, clickedCol, clickedCell) {
  for (let dr = -5; dr <= 5; dr++) {
    for (let dc = -5; dc <= 5; dc++) {
      if (dr == 0 && dc == 0) continue;

      let neighbourRow = clickedRow + dr;
      let neighbourCol = clickedCol + dc;
      if (neighbourRow < 0 || neighbourRow >= gridSize) continue;
      if (neighbourCol < 0 || neighbourCol >= gridSize) continue;
      let cellData = board[neighbourRow][neighbourCol];
      let nearbySignals = cellData.adjacent.radius1 + cellData.adjacent.radius2;
      if (nearbySignals == 0 && !cellData.pinged && !cellData.signal) {
        cellData.pinged = true; // mark as revealed

        let cellElement = document.getElementById(
          `cell-${neighbourRow}-${neighbourCol}`
        );
        cellElement.classList.add("empty"); // show all empty cells within the 5 radius at the start
        fadeCell(cellElement, 2000, ["empty"], true);
      }
    }
  }
}

function fadeCell(cell, delay = fadeout, removeClasses = [], clearText = true) {
  setTimeout(() => {
    removeClasses.forEach((cls) => cell.classList.remove(cls));
    if (clearText) cell.textContent = "";
  }, delay);
}

function checkWin() {
  let correctFlags = 0;
  let incorrectFlags = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let cellData = board[r][c];
      if (cellData.flagged) {
        if (cellData.signal) {
          correctFlags++;
        } else {
          incorrectFlags++;
        }
      }
    }
  }

  if (correctFlags == totalSignals && incorrectFlags == 0) {
    //  gameOver = true;

    document.getElementById("feedback").textContent = "You win!";
  }
}

function resetGame(newSize = gridSize, newSignals = totalSignals) {
  gridSize = newSize;
  totalSignals = newSignals;
  document.getElementById("feedback").textContent = "";
  board = [];
  generateBoard(gridSize);
  document.getElementById("grid").innerHTML = "";
  generateGrid(gridSize);
  firstClick = true;
  // gameOver = false;
  attachListeners();
}

function toggleFlag(e) {
  // if (gameOver) return;
  let clickedCell = e.target;
  e.preventDefault();
  let clickedRow = parseInt(clickedCell.dataset.row);
  let clickedCol = parseInt(clickedCell.dataset.col);
  if (board[clickedRow][clickedCol].pinged == true) {
    return;
  } else if (board[clickedRow][clickedCol].flagged) {
    board[clickedRow][clickedCol].flagged = false;
    clickedCell.textContent = ""; // no flag
    clickedCell.classList.remove("flagged");
  } else {
    board[clickedRow][clickedCol].flagged = true;
    clickedCell.textContent = "🚩"; // add flag
    clickedCell.classList.add("flagged");
  }
  checkWin();
}

// ==== UI + INTERACTION ====

function disableInputs() {
  let cells = document.querySelectorAll("td");
  cells.forEach((cell) => {
    cell.replaceWith(cell.cloneNode(true)); // easiest way to remove all listeners
  });
}

function attachListeners() {
  // all my listeners
  let cells = document.querySelectorAll("td");
  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick); // left click
  });
  cells.forEach((cell) => {
    cell.addEventListener("contextmenu", toggleFlag); // right click
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    resetGame(gridSize, totalSignals);
  });
  document.getElementById("applyBtn").addEventListener("click", customise);

  // phone long tap
  cells.forEach((cell) => {
    let pressTimer;
    let longPressTriggered = false;

    cell.addEventListener("touchstart", (e) => {
      e.preventDefault();
      longPressTriggered = false;
      pressTimer = setTimeout(() => {
        toggleFlag(e);
        longPressTriggered = true;
      }, 600); // long press
    });

    cell.addEventListener("touchend", (e) => {
      clearTimeout(pressTimer);
      if (!longPressTriggered) {
        handleCellClick(e); // treat as single tap
      }
    });
  });
}

function customise() {
  let inputSize = document.getElementById("gridSizeInput").value;
  let inputSignal = document.getElementById("signalInput").value;

  let newSize = gridSize;
  let newSignals = totalSignals;

  if (inputSize !== "") {
    newSize = parseInt(inputSize);
  }
  if (inputSignal !== "") {
    newSignals = parseInt(inputSignal);
  }
  resetGame(newSize, newSignals);
}

// ==== BOARD VALIDATION ====
