// ==== GLOBALs + CONSTANTS ====

let gridSize = 10; // start with 10, easier to adjust later
let totalMines = 10;
let firstClick = true;
let board = [];
let grid = [];
let gameOver = false;

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
        mine: false,
        revealed: false,
        adjacent: 0,
        flagged: false,
      });
    }
    board.push(rowData);
  }
}

// create the MINES. put within checkanswer
function generateMines(clickedRow, clickedCol, newMines = totalMines) {
  totalMines = newMines;
  let minesNumber = 0;
  let mineCol = 0;
  let mineRow = 0;

  while (minesNumber < totalMines) {
    mineCol = Math.floor(Math.random() * gridSize);
    mineRow = Math.floor(Math.random() * gridSize);
    if (mineCol == clickedCol && mineRow == clickedRow) continue;
    if (
      board[mineRow][mineCol].mine == true ||
      isAdjacent(mineRow, mineCol, clickedRow, clickedCol) // if mine or if is adjacent to the cell
    )
      continue; // skip!

    board[mineRow][mineCol].mine = true; // set the mine flag
    minesNumber++;
  }

  // count adjacent once all mines placed
  // For each cell, loop through its 8 neighbors
  // If neighbor is in bounds and has a mine, increment adjacent count
  let boardCol = 0;
  let boardRow = 0;

  for (boardRow = 0; boardRow < gridSize; boardRow++) {
    for (boardCol = 0; boardCol < gridSize; boardCol++) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr == 0 && dc == 0) continue;

          let neighbourRow = boardRow + dr;
          let neighbourCol = boardCol + dc;
          if (neighbourRow < 0 || neighbourRow >= gridSize) continue;
          if (neighbourCol < 0 || neighbourCol >= gridSize) continue;

          if (board[neighbourRow][neighbourCol].mine == true) {
            board[boardRow][boardCol].adjacent++;
          }
        }
      }
    }
  }
}

// ==== GAME LOGIC ====

function checkAnswer(e) {
  let clickedCell = e.target;
  let clickedRow = parseInt(clickedCell.dataset.row);
  let clickedCol = parseInt(clickedCell.dataset.col);
  if (gameOver) return;
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
    }

    firstClick = false;
    revealCell(clickedRow, clickedCol, clickedCell);
  } else {
    revealCell(clickedRow, clickedCol, clickedCell);
    checkWin();
  }
}

function revealCell(clickedRow, clickedCol, clickedCell) {
  if (
    board[clickedRow][clickedCol].revealed == true ||
    board[clickedRow][clickedCol].flagged == true
  ) {
    return;
  } else if (board[clickedRow][clickedCol].mine == true) {
    clickedCell.classList.add("mine");
    triggerGameOver();
    return; // need this cuz after running gameOver(), it will come back to this
  } else {
    board[clickedRow][clickedCol].revealed = true;
    if (board[clickedRow][clickedCol].adjacent > 0) {
      clickedCell.classList.add("revealed");
      clickedCell.innerHTML = `${board[clickedRow][clickedCol].adjacent}`;
    } else {
      clickedCell.classList.add("revealed"); // the clicked cell only

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr == 0 && dc == 0) continue;

          let neighbourRow = clickedRow + dr;
          let neighbourCol = clickedCol + dc;
          if (neighbourRow < 0 || neighbourRow >= gridSize) continue;
          if (neighbourCol < 0 || neighbourCol >= gridSize) continue;

          let neighbourCell = document.getElementById(
            `cell-${neighbourRow}-${neighbourCol}`
          );
          if (board[neighbourRow][neighbourCol].flagged == true) continue;
          revealCell(neighbourRow, neighbourCol, neighbourCell); // CASCADE!!
        }
      }
    }
  }
}

function checkWin() {
  let revealedCount = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let cellData = board[r][c];
      if (!cellData.mine && cellData.revealed == true) {
        // just check non mines in case.
        revealedCount++;
      }
    }
  }

  if (revealedCount == gridSize * gridSize - totalMines) {
    gameOver = true;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
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
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
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

function resetGame(newSize = gridSize, newMines = totalMines) {
  gridSize = newSize;
  totalMines = newMines;
  document.getElementById("feedback").textContent = "";
  board = [];
  generateBoard(gridSize);
  document.getElementById("grid").innerHTML = "";
  generateGrid(gridSize);
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
    cell.addEventListener("click", checkAnswer); // left click
  });
  cells.forEach((cell) => {
    cell.addEventListener("contextmenu", toggleFlag); // right click
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    resetGame(gridSize, totalMines);
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
        checkAnswer(e); // treat as single tap
      }
    });
  });
}

function customise() {
  let inputSize = document.getElementById("gridSizeInput").value;
  let inputMine = document.getElementById("mineInput").value;

  let newSize = gridSize;
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

  let revealedMap = Array(gridSize)
    .fill()
    .map(() => Array(gridSize).fill(false));

  // Create a list of flagged cells (initially empty)
  // tracks whether a cell is flagged in your simulation

  let flaggedMap = Array(gridSize)
    .fill()
    .map(() => Array(gridSize).fill(false));

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

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!revealedMap[row][col]) continue; // skip if it's not yet opened

        let cell = testBoard[row][col];
        if (cell.adjacent == 0) continue;

        let hidden = [];
        let flagged = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr == 0 && dc == 0) continue;
            let nr = row + dr;
            let nc = col + dc;
            if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;

            if (flaggedMap[nr][nc])
              flagged++; // count how many flagged cells are in the adjacent of this cell
            else if (!revealedMap[nr][nc]) hidden.push([nr, nc]);
          }
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
  let totalSafeCells = gridSize * gridSize - totalMines;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (revealedMap[r][c] && testBoard[r][c].mine == false) {
        revealedSafe++;
      }
    }
  }
  if (revealedSafe == totalSafeCells) {
    return true;
  } else {
    return false;
  }
}
// Step 5: Retry logic (outside this function)
// If validateBoard() returns false, regenerate mines and try again
// already put in generateMines(), after first click

function cloneBoard(board) {
  let testBoard = [];
  for (let row = 0; row < gridSize; row++) {
    let rowTest = [];
    for (let col = 0; col < gridSize; col++) {
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

  // cascade to neighbours
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr == 0 && dc == 0) continue;

      let neighbourRow = clickedRow + dr;
      let neighbourCol = clickedCol + dc;
      if (
        neighbourRow < 0 ||
        neighbourRow >= gridSize ||
        neighbourCol < 0 ||
        neighbourCol >= gridSize
      )
        continue;
      cascadeReveal(neighbourRow, neighbourCol, testBoard, revealedMap); // CASCADE!!
    }
  }
}
