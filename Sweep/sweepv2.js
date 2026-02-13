// ==== GLOBALs + CONSTANTS ====

let size = 10; // start with 10, easier to adjust later
let totalMines = 10;
let firstClick = true;
let board = [];
let grid = [];
let gameOver = false;

// ==== INITIALISATION + GENERATION ====

document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  document.getElementById("grid").innerHTML = "";
  generateGrid(size);
  generateBoard(size);
  populateNeighbours();
  attachListeners();
}

// visible GRID
function generateGrid(size) {
  grid = [];
  for (let gridRow = 0; gridRow < size; gridRow++) {
    let tr = document.createElement("tr");
    for (let gridCol = 0; gridCol < size; gridCol++) {
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
function generateBoard(size) {
  board = [];
  for (let row = 0; row < size; row++) {
    let rowData = [];
    for (let col = 0; col < size; col++) {
      rowData.push({
        mine: false,
        revealed: false,
        adjacent: 0,
        flagged: false,
        neighbours: [],
      });
    }
    board.push(rowData);
  }
  console.log("board generated");
}

function populateNeighbours() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      board[r][c].neighbours = getNeighbourCoords(r, c);
    }
  }
  console.log(board[0][0].neighbours);
}
// now each cell knows its neighbours, and can check the specific 8 immediately instead of looking through the whole board

// create the MINES. put within checkanswer
function generateMines(clickedRow, clickedCol, newMines = totalMines) {
  totalMines = newMines;

// RESET everything first. *in case* validate board regenerates board due to unsolvability.
for (let r = 0; r < size; r++) {
for (let c = 0; c < size; c++) {
board[r][c].mine = false
board[r][c].adjacent = 0
}}

// then place mines
  let minesNumber = 0;
  let mineCol = 0;
  let mineRow = 0;

  while (minesNumber < totalMines) {
    mineCol = Math.floor(Math.random() * size);
    mineRow = Math.floor(Math.random() * size);
    if (mineCol == clickedCol && mineRow == clickedRow) continue;
    if (
      board[mineRow][mineCol].mine == true ||
      isAdjacent(mineRow, mineCol, clickedRow, clickedCol) // if mine or if is adjacent to the cell
    )
      continue; // skip!

    board[mineRow][mineCol].mine = true; // set the mine flag
    minesNumber++;
  }
  console.log("mines placed");

  // count adjacent once all mines placed
  // For each cell, loop through its 8 neighbors
  // If neighbor is in bounds and has a mine, increment adjacent count

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let cell = board[r][c];
      let count = 0;
      for (let [nr, nc] of cell.neighbours) {
        if (board[nr][nc].mine) count++;
      }
      cell.adjacent = count;
    }
  }
  console.log("adjacent count completed");
}

// ==== GAME LOGIC ====

function handleClicks(r, c, cellEl) {
 if (gameOver) return;
let cell = board[r][c]

if (!cell.revealed) {
  checkAnswer(r, c, cellEl);
} else {
  chordCell(r, c);
}
}

function checkAnswer(clickedRow, clickedCol, clickedCell) {
//  let clickedCell = e.target;
//  let clickedRow = parseInt(clickedCell.dataset.row);
//  let clickedCol = parseInt(clickedCell.dataset.col);
//  if (gameOver) return;
  if (firstClick) {
    generateMines(clickedRow, clickedCol);

    // validate board after generating mines
    let isValid = validateBoard(clickedRow, clickedCol);
    if (!isValid) {
      let attempts = 0;
      while (!isValid && attempts < 10) {
        // attempts is more impt in sudoku, to throw out the board entirely?
        generateMines(clickedRow, clickedCol);
        isValid = validateBoard(clickedRow, clickedCol);
        attempts++;
      }
      if (!isValid && attempts >= 10) {
        document.getElementById("feedback").textContent =
          "Something went wrong, please start a new game.";
      }
    }

    firstClick = false;
    revealCell(clickedRow, clickedCol, clickedCell);
  } else {
    revealCell(clickedRow, clickedCol, clickedCell);
    checkWin();
  }
}

function revealCell(clickedRow, clickedCol, clickedCell) {
  let cell = board[clickedRow][clickedCol];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  clickedCell.classList.add("revealed");

  if (cell.mine) {
    clickedCell.classList.add("mine");
    triggerGameOver();
    return; // need this cuz after running gameOver(), it will come back to this
  }
  if (cell.adjacent > 0) {
    clickedCell.textContent = cell.adjacent;
    return;
  }
  // adjacent == 0 --> cascade

  for (let [nr, nc] of cell.neighbours) {
    if (board[nr][nc].flagged) continue;

    let neighbourCell = document.getElementById(`cell-${nr}-${nc}`);
    revealCell(nr, nc, neighbourCell); // CASCADE!!
  }
}

function chordCell(clickedRow, clickedCol) {
let cell = board[clickedRow][clickedCol];
if (!cell.revealed || cell.adjacent == 0) return;
let flagged = 0
let hidden = []
for (let [nr, nc] of cell.neighbours) {
if (board[nr][nc].flagged) flagged++;
else if (!board[nr][nc].revealed) hidden.push([nr, nc])
}
if (flagged == cell.adjacent) {
hidden.forEach(([nr, nc]) => {
revealCell(nr, nc, document.getElementById(`cell-${nr}-${nc}`))
})
}}

function checkWin() {
  let revealedCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let cellData = board[r][c];
      if (!cellData.mine && cellData.revealed == true) {
        // just check non mines in case.
        revealedCount++;
      }
    }
  }

  if (revealedCount == size * size - totalMines) {
    gameOver = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let cellData = board[r][c];
        if (cellData.mine == true && !cellData.revealed) {
          let cellElement = document.getElementById(`cell-${r}-${c}`);
          cellElement.textContent = "💣"; // add flag
        }
        cellData.revealed = true;
        document.getElementById("feedback").textContent = "You win!";
      }
    }
  }
}

function triggerGameOver() {
gameOver = true
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let cellData = board[r][c];
      let cellElement = document.getElementById(`cell-${r}-${c}`);

      if (cellData.mine) {
        cellData.revealed = true;
        cellElement.classList.add("mine");
        cellElement.textContent = "💣"; // add flag
      }
    }
  }
}

function resetGame(newSize = size, newMines = totalMines) {
  size = newSize;
  totalMines = newMines;
  document.getElementById("feedback").textContent = "";
  board = [];
  generateBoard(size);
  populateNeighbours();
  document.getElementById("grid").innerHTML = "";
  generateGrid(size);
  firstClick = true;
  gameOver = false;
  attachListeners();
}

function isAdjacent(r, c, clickedRow, clickedCol) {
  // check how far apart is 2 cells (for generating mines)
  return Math.abs(r - clickedRow) <= 1 && Math.abs(c - clickedCol) <= 1;
}

function toggleFlag(e) {
  if (gameOver) return;
  let clickedCell = e.target;
  e.preventDefault();
  let clickedRow = parseInt(clickedCell.dataset.row);
  let clickedCol = parseInt(clickedCell.dataset.col);
  if (board[clickedRow][clickedCol].revealed == true) {
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
}

function revealHint() {
  let safeCell = findGuaranteedSafeCell();
  if (safeCell) {
    highlightCell(safeCell.r, safeCell.c);
  } else {
    document.getElementById("feedback").textContent =
      "No guaranteed safe move.";
  }
}

function findGuaranteedSafeCell() { // incomplete hint system
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let cell = board[r][c];
      if (!cell.revealed || cell.adjacent == 0) continue;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr == 0 && dc == 0) continue;
          let neighbourRow = r + dr;
          let neighbourCol = c + dc;
          if (neighbourRow < 0 || neighbourRow >= size) continue;
          if (neighbourCol < 0 || neighbourCol >= size) continue;

          let neighbourCell = board[neighbourRow][neighbourCol];
          // ****
        }
      }
    }
  }
}

function getNeighbourCoords(r, c) {
  let neighbours = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr == 0 && dc == 0) continue;
      let neighbourRow = r + dr;
      let neighbourCol = c + dc;
      if (neighbourRow < 0 || neighbourRow >= size) continue;
      if (neighbourCol < 0 || neighbourCol >= size) continue;

      neighbours.push([neighbourRow, neighbourCol]);
    }
  }
  return neighbours;
}

function highlightCell(r, c) {
  let cellElement = document.getElementById(`cell-${r}-${c}`);
  cellElement.classList.add("hint");

  // Remove highlight after short delay
  setTimeout(() => {
    cellElement.classList.remove("hint");
  }, 1500);
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
    cell.addEventListener("click", onClick); // left click
  });
  cells.forEach((cell) => {
    cell.addEventListener("contextmenu", toggleFlag); // right click
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    resetGame(size, totalMines);
  });
  document.getElementById("hintBtn").addEventListener("click", () => {
    revealHint();
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
        let r = parseInt(cell.dataset.row);
        let c = parseInt(cell.dataset.col);
        let cellData = board[r][c];
    
handleClicks(r, c, cell);
      }
    });
  });
}

function onClick(e) {
if (!e.target.classList.contains("cell")) return;
let cellEl = e.target;
  let clickedRow = parseInt(cellEl.dataset.row);
  let clickedCol = parseInt(cellEl.dataset.col);
handleClicks(clickedRow, clickedCol, cellEl);
}

function customise() {
  let inputSize = document.getElementById("sizeInput").value;
  let inputMine = document.getElementById("mineInput").value;

  let newSize = size;
  let newMines = totalMines;

  if (inputSize !== "") {
    newSize = parseInt(inputSize);
  }
  if (inputMine !== "") {
    newMines = parseInt(inputMine);
  }
  resetGame(newSize, newMines);
}



// ==== BOARD VALIDATION ====

function validateBoard(clickedRow, clickedCol) {
  // use after firstclick
  // Step 1: Setup
  // Create a copy of the board state (optional, for simulation)
  // test board is like board. holds data, doesn't change during the game

  let testBoard = cloneBoard(board); // this allows testBoard to store the cloneboard data itself

  // Create a list of revealed cells starting from the first click
  // creates a 2D array (same shape as your board) where each cell starts as false, meaning not revealed
  // revealedMap is for keeping track of the player, as though he is actually playing the board, like checkAnswer(e)

  let revealedMap = Array(size)
    .fill()
    .map(() => Array(size).fill(false));

  // Create a list of flagged cells (initially empty)
  // tracks whether a cell is flagged in your simulation

  let flaggedMap = Array(size)
    .fill()
    .map(() => Array(size).fill(false));

  // Step 2: Simulate logical deduction
  // Loop through revealed cells
  // For each cell with a number:
  //   - Count hidden neighbors
  //   - Count flagged neighbors
  //   - If adjacent == flagged count → reveal remaining hidden neighbors
  //   - If adjacent == hidden count → flag all hidden neighbors

  cascadeReveal(clickedRow, clickedCol, testBoard, revealedMap);

  // Step 3: Track progress
  // Keep a counter of how many non-mine cells are revealed (using flaggedMap)
  // Stop when no new cells are revealed in a loop (change = false ==> exit)
  let change = true;
  while (change) {
    change = false; // rmb to add change = true after logic, so that it continues to run as long as there are new reveals

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!revealedMap[row][col]) continue; // skip if it's not yet opened

        let cell = testBoard[row][col];
        if (cell.adjacent == 0) continue;

        let hidden = [];
        let flagged = 0;
        for (let [nr, nc] of cell.neighbours) {
          if (flaggedMap[nr][nc])
            flagged++; // count how many flagged cells are in the adjacent of this cell
          else if (!revealedMap[nr][nc]) hidden.push([nr, nc]);
        }

        if (hidden.length > 0) {
          // hidden.length > 0 meaning there's still hidden cells
          // Condition 1: all adjacent mines flagged ==> rest are safe
          if (cell.adjacent == flagged) {
            hidden.forEach(([nr, nc]) => {
              cascadeReveal(nr, nc, testBoard, revealedMap);
            });
            change = true;
          }

          // Condition 2: all adjacent is hidden ==> adjacents are mines ==> flag them
          if (cell.adjacent == hidden.length + flagged) {
            // + flagged to account for those already flagged
            hidden.forEach(([nr, nc]) => {
              flaggedMap[nr][nc] = true;
            });
            change = true;
          }
        }
      }
    }
  }

  // Step 4: Evaluate
  // If revealed count == total safe cells → return true (valid board)
  // Else → return false (board requires guessing)

  let revealedSafe = 0;
  let totalSafeCells = size * size - totalMines;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (revealedMap[r][c] && testBoard[r][c].mine == false) {
        revealedSafe++;
      }
    }
  }

  return revealedSafe == totalSafeCells;
}

// Step 5: Retry logic (outside this function)
// If validateBoard() returns false, regenerate mines and try again
// already put in generateMines(), after first click

function cloneBoard(board) {
  let testBoard = [];
  for (let row = 0; row < size; row++) {
    let rowTest = [];
    for (let col = 0; col < size; col++) {
      rowTest.push({ ...board[row][col] });
    }
    testBoard.push(rowTest);
  }
  return testBoard; // only by returning, we can access it in the validate board (). it's not really global though
}

function cascadeReveal(clickedRow, clickedCol, testBoard, revealedMap) {
  if (revealedMap[clickedRow][clickedCol]) return;
  revealedMap[clickedRow][clickedCol] = true;
  if (testBoard[clickedRow][clickedCol].adjacent > 0) return;
  for (let [nr, nc] of testBoard[clickedRow][clickedCol].neighbours) {
    cascadeReveal(nr, nc, testBoard, revealedMap); // CASCADE!!
  }
}