// ==== NAMING RULES ====
// cellElement → DOM cell (what the player sees)
// boardData   → logical cell (what the game knows)
// Keep them separate!

// ==== GLOBALs + CONSTANTS ====

let gridSize = 10; // start with 10, easier to adjust later
let blackCell = Math.floor(Math.random() * 11) + 40;
// let firstClick = true;
let board = [];
let grid = [];
let gameOver = false;
let sectorSize = Math.max(3, Math.floor(gridSize / 3)); // dynamic sector size
let errorCells = new Set(); // if error, errorCells.add("1,5") .delete .has .... use string.
let anchorCount = 0;

// ==== INITIALISATION + GENERATION ====

document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  generateValidBoard();
  //  removeClues();
  generateGrid();
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
  addVisualNumbers();
}

// create clear logic BOARD (the invisible one BTS)
function generateBoard(gridSize) {
  board = [];
  for (let row = 0; row < gridSize; row++) {
    let rowData = [];
    for (let col = 0; col < gridSize; col++) {
      rowData.push({
        colour: "grey", // "grey", "black", "white"
        state: "neutral", // "neutral" / "revealed" / "error"
        adjacent: 0, // use this for the number shown on the cell
        isBlack: false, // determines if cell is black or white
        displayed: true, // number is showing or not
        isAnchor: false, // points to start deductions from
        sectorID:
          Math.floor(row / sectorSize) + "-" + Math.floor(col / sectorSize),
      });
    }
    board.push(rowData);
  }
}

// create the blackcells. put within checkanswer
function generateCells() {
  let blackNumber = 0;
  let col = 0;
  let row = 0;

  while (blackNumber < blackCell) {
    col = Math.floor(Math.random() * gridSize);
    row = Math.floor(Math.random() * gridSize);
    if (board[row][col].isBlack == true) continue;

    board[row][col].isBlack = true; // set the signal flag
    blackNumber++;
  }

  // count adjacency
  let boardCol = 0;
  let boardRow = 0;

  for (boardRow = 0; boardRow < gridSize; boardRow++) {
    for (boardCol = 0; boardCol < gridSize; boardCol++) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let neighbourRow = boardRow + dr;
          let neighbourCol = boardCol + dc;

          if (neighbourRow < 0 || neighbourRow >= gridSize) continue;
          if (neighbourCol < 0 || neighbourCol >= gridSize) continue;

          if (board[neighbourRow][neighbourCol].isBlack == true) {
            if (isAdjacent(neighbourRow, neighbourCol, boardRow, boardCol)) {
              board[boardRow][boardCol].adjacent++;
            }
          }
        }
      }
    }
  } validateBoard()
}

function addVisualNumbers() {
  let boardCol = 0;
  let boardRow = 0;
  for (boardRow = 0; boardRow < gridSize; boardRow++) {
    for (boardCol = 0; boardCol < gridSize; boardCol++) {
      let cellElement = document.getElementById(`cell-${boardRow}-${boardCol}`);
      if (board[boardRow][boardCol].displayed) {
        cellElement.textContent = String(board[boardRow][boardCol].adjacent);
      } else {
        cellElement.textContent = "";
      }
    }
  }
}

function checkAnchorSpread(
  minPerSector = Math.max(1, Math.floor(gridSize / 10))
) {
  let sectorCount = {};
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c].isAnchor) {
        let id = board[r][c].sectorID;
        sectorCount[id] = (sectorCount[id] || 0) + 1;
      }
    }
  }
  return Object.values(sectorCount).every((count) => count >= minPerSector);
}

function generateValidBoard() {
  let attempts = 0;
  let maxAttempts = 200;
  do {
    generateBoard(gridSize); // empty board
    generateCells(); // fill logic
    attempts++;
    if (attempts > maxAttempts) {
      document.getElementById("feedback").textContent =
        "Too many retries, stopping.";
      break;
    }
  } while (!checkAnchor());
}

function checkAnchor() {
  let anchors = calcAnchorCount(board, gridSize);
  return validAnchorCount(anchors, gridSize) && checkAnchorSpread();
}

function calcAnchorCount(board, gridSize) {
  let anchorCount = 0;
  for (row = 0; row < gridSize; row++) {
    for (col = 0; col < gridSize; col++) {
      let boardData = board[row][col];
      if (boardData.adjacent == 0 || boardData.adjacent == 9) {
        anchorCount++;
        boardData.isAnchor = true;
        boardData.displayed = true;
      }
      if (row == 0 || row == gridSize - 1 || col == 0 || col == gridSize - 1) {
        if (boardData.adjacent == 6) {
          anchorCount += 0.8;
          boardData.isAnchor = true;
          boardData.displayed = true;
        }
      }
      if (
        (row == 0 || row == gridSize - 1) &&
        (col == 0 || col == gridSize - 1)
      ) {
        if (boardData.adjacent == 4) {
          anchorCount += 0.6;
          boardData.isAnchor = true;
          boardData.displayed = true;
        }
      } else if (boardData.adjacent == 8 || boardData.adjacent == 1) {
        anchorCount += 0.2;
        boardData.isAnchor = true;
        boardData.displayed = true;
      }
    }
  }
  return anchorCount;
}

function validAnchorCount(anchorCount, gridSize) {
  // just for determining min/max. no calcs
  let minAnchor = gridSize * gridSize * 0.08;
  // let maxAnchor = gridSize * gridSize * 0.5 // removed cuz criteria too tight
  return anchorCount > minAnchor; // && anchorCount < maxAnchor
}

function randomiseAnchorVisibility() {
  for (row = 0; row < gridSize; row++) {
    for (col = 0; col < gridSize; col++) {
      if (board[row][col].isAnchor) {
        board[row][col].displayed = Math.random() < 0.75;
      }
    }
  }
}

// ==== HELPER FUNCTIONS ====

function isAdjacent(r, c, clickedRow, clickedCol) {
  // check how far apart is 2 cells (mainly for generating clear area around the first click)
  return Math.abs(r - clickedRow) <= 1 && Math.abs(c - clickedCol) <= 1;
}

function maxValidCells(row, col, size) {
  // impt for cells at sides
  if ((row == 0 || row == size - 1) && (col == 0 || col == size - 1)) {
    return 4; // corner
  } else if (row == 0 || col == 0 || row == size - 1 || col == size - 1) {
    return 6; // border
  } else {
    return 9;
  }
}

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

// ==== GAMEPLAY LOGIC (should be set unless change in variable names) ====

function countImmediate(clickedRow, clickedCol) {
  let boardData = board[clickedRow][clickedCol];
  let blackCount = 0;
  let whiteCount = 0;
  let cellCount = 0;
  for (let r = clickedRow - 1; r <= clickedRow + 1; r++) {
    for (let c = clickedCol - 1; c <= clickedCol + 1; c++) {
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
      cellCount++;
      let nData = board[r][c];
      if (nData.colour == "black") {
        blackCount++;
      } else if (nData.colour == "white") {
        whiteCount++;
      }
    }
  }
  return { blackCount, whiteCount, cellCount };
}

function checkImmediate(clickedRow, clickedCol) {
  let { blackCount, whiteCount, cellCount } = countImmediate(
    clickedRow,
    clickedCol
  );
  let boardData = board[clickedRow][clickedCol];
  if (!boardData.displayed) return;
  let isError =
    blackCount > boardData.adjacent ||
    whiteCount > cellCount - boardData.adjacent;
  let cellElement = document.getElementById(`cell-${clickedRow}-${clickedCol}`);
  let coords = `${clickedRow},${clickedCol}`;
  if (isError) {
    cellElement.classList.add("error");
    errorCells.add(coords);
  } else if (!isError) {
    cellElement.classList.remove("error");
    errorCells.delete(coords);
  }
}

function updateArea(clickedRow, clickedCol) {
  // not accurate.
  for (let r = clickedRow - 2; r <= clickedRow + 2; r++) {
    for (let c = clickedCol - 2; c <= clickedCol + 2; c++) {
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
      if (!board[r] || !board[r][c]) continue; // just in case it checks outside
      checkImmediate(r, c);
    }
  }
}

function checkWin() {
  if (errorCells.size > 0) return;
  let correctTile = 0;
  let incorrectTile = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let cellData = board[r][c];
      if (cellData.state == "neutral") return;
      if (cellData.isBlack && cellData.colour == "black") {
        correctTile++;
      } else if (cellData.isBlack && cellData.colour != "black") {
        incorrectTile++;
      }
    }
  }
  if (correctTile == blackCell && incorrectTile == 0) {
    gameOver = true;
    triggerGameOver();
    document.getElementById("feedback").textContent = "You win! Good job.";
  }
}

function resetGame(newSize = gridSize) {
  gridSize = newSize;
  document.getElementById("feedback").textContent = "";
  board = [];
  generateBoard(gridSize);
  document.getElementById("grid").innerHTML = "";
  generateGrid(gridSize);
  generateCells();
  gameOver = false;
  errorCells = new Set();
  attachListeners();
}

// ==== UI + INTERACTION ====

function handleCellClick(e) {
  // left click turns it BLACK, even from white
  let clickedCell = e.target;
  let clickedRow = parseInt(clickedCell.dataset.row);
  let clickedCol = parseInt(clickedCell.dataset.col);
  let boardData = board[clickedRow][clickedCol];
  if (gameOver) return;
  if (boardData.state == "neutral" || boardData.colour == "white") {
    boardData.state = "revealed";
    boardData.colour = "black";
    clickedCell.classList.remove("grey", "white");
    clickedCell.classList.add("black");
    updateArea(clickedRow, clickedCol);
    checkWin();
  } else if (boardData.state == "revealed" && boardData.colour == "black") {
    boardData.state = "neutral";
    boardData.colour = "grey";
    clickedCell.classList.remove("black");
    clickedCell.classList.add("grey");
    updateArea(clickedRow, clickedCol);
  }
}

function toggleWhite(e) {
  // right click turns it WHITE
  if (gameOver) return;
  let clickedCell = e.target;
  e.preventDefault();
  let clickedRow = parseInt(clickedCell.dataset.row);
  let clickedCol = parseInt(clickedCell.dataset.col);
  let boardData = board[clickedRow][clickedCol];

  if (boardData.state == "neutral" || boardData.colour == "black") {
    boardData.state = "revealed";
    boardData.colour = "white";
    clickedCell.classList.remove("grey", "black");
    clickedCell.classList.add("white");
    updateArea(clickedRow, clickedCol);
    checkWin();
  } else if (boardData.state == "revealed" && boardData.colour == "white") {
    boardData.state = "neutral";
    boardData.colour = "grey";
    clickedCell.classList.remove("white");
    clickedCell.classList.add("grey");
    updateArea(clickedRow, clickedCol);
  }
}

function triggerGameOver() {
  // disableInputs
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
    cell.addEventListener("contextmenu", toggleWhite); // right click
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    resetGame(gridSize);
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
        toggleWhite(e);
        longPressTriggered = true;
      }, 300); // long press
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
  let newSize = gridSize;
  if (inputSize !== "") {
    newSize = parseInt(inputSize);
  }
  resetGame(newSize);
}

// // ==== BOARD VALIDATION ====
// // Part 1: ensure board is playable with all numbers shown (settled with anchorcount + spread check)
// // Part 2: hide numbers while ensuring board is still solvable

function validateBoard() {
let testBoard = cloneBoard(board)
isSolvable(testBoard)
}

function isSolvable(testBoard) {
// Implement solving logic:
// 1. For each cell, toggle black/white based on constraints.
// 2. Validate that all numbers match black cells in their 3x3 area.
// 3. If multiple solutions exist → return false.
// 4. If exactly one solution exists → return true.

let madeProgress = true;
while (madeProgress) {
madeProgress = false;
for (let row = 0; row < testBoard.length; row++) {
    for (let col = 0; col < testBoard.length; col++) {
let changed = applyClue(testBoard, row, col)
if (changed) {
madeProgress = true;
}}}}}

function applyClue(testBoard, row, col) {
  let cell = testBoard[row][col];
  let clue = cell.adjacent;
  let maxCells = maxValidCells(row, col, testBoard.length);
  let counts = countNeighbours(row, col, testBoard);
  let unknownCells = counts.unknown;
  let knownBlacks = counts.blacks;
  let knownWhites = counts.whites;
  let changed = false;

  // Early exit if nothing to do
  if (unknownCells === 0) return false;

  for (let nr = row - 1; nr <= row + 1; nr++) {
    for (let nc = col - 1; nc <= col + 1; nc++) {
      if (nr < 0 || nr >= testBoard.length || nc < 0 || nc >= testBoard.length) continue;
      let neighbourCell = testBoard[nr][nc];

      // Extreme cases
      if (clue === maxCells && neighbourCell.state !== "revealed") {
        neighbourCell.colour = "black";
        neighbourCell.state = "revealed";
        changed = true;
      }

      if (clue === 0 && neighbourCell.state !== "revealed") {
        neighbourCell.colour = "white";
        neighbourCell.state = "revealed";
        changed = true;
      }

      // Deduction cases
      if ((clue - knownBlacks === unknownCells) && neighbourCell.colour === "grey") {
        neighbourCell.colour = "black";
        neighbourCell.state = "revealed";
        changed = true;
      }

      if ((clue === knownBlacks) && neighbourCell.colour === "grey") {
        neighbourCell.colour = "white";
        neighbourCell.state = "revealed";
        changed = true;
      }
    }
  }

  return changed;
}

function countNeighbours(row, col, testBoard) {
let unknown = 0
  let blacks = 0
  let whites = 0

for (let nr = row - 1; nr <= row + 1; nr++) {
  for (let nc = col - 1; nc <= col + 1; nc++) {
if (nr < 0 || nr >= testBoard.length || nc < 0 || nc >= testBoard.length) continue;

 let neighbourCell = testBoard[nr][nc] 

if (neighbourCell.colour == "grey") { unknown++ }
else if (neighbourCell.colour == "black") { blacks++ }
else if (neighbourCell.colour == "white") { whites++ }
}}
return { unknown, blacks, whites }
}


// Hiding clues
function createPuzzle() {
let puzzleBoard = cloneBoard(board)
let hiddenTarget = gridSize * gridSize * 0.65 // 65% hidden
let hiddenCount = 0

while (hiddenCount < hiddenTarget) {
let r = Math.floor(Math.random() * gridSize)
let c = Math.floor(Math.random() * gridSize)
if (puzzleBoard[r][c].isDisplayed == false) continue;
let originalClue = puzzleBoard[r][c].adjacent
puzzleBoard[r][c].isDisplayed = false
isSolvable




isSolvable(puzzleBoard)
}
}