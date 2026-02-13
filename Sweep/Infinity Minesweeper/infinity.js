// ==== GLOBALs + CONSTANTS ====

let size = 8; // start with 10, easier to adjust later
// let totalMines = Math.floor(Math.random() * 16 + 10);
let firstClick = true;
let board = new Map();
let grid = [];
let gameOver = false;
let forcedFirstNumber = null;

// ==== INITIALISATION + GENERATION ====

document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  document.getElementById("grid").innerHTML = "";
  generateGrid(size);
  //  generateBoard(size);
  attachListeners();
}

// visible GRID
function generateGrid(size) {
  for (let gridRow = 0; gridRow < size; gridRow++) {
    let tr = document.createElement("tr");

    for (let gridCol = 0; gridCol < size; gridCol++) {
      let td = document.createElement("td");

      td.classList.add("cell");
      td.dataset.row = gridRow;
      td.dataset.col = gridCol;
      td.id = `cell-${gridRow}-${gridCol}`;

      if (gridCol % size == 0) {
        td.classList.add("sector-left");
      }
      if (gridRow % size == 0) {
        td.classList.add("sector-top");
      }

      tr.appendChild(td);
    }
    document.getElementById("grid").appendChild(tr);
  }
}

// ==== GAME LOGIC ====

function handleClicks(r, c, cellEl) {
  // reveal
  if (gameOver) return;

  let cell = ensureCell(r, c);

  if (!cell.revealed) {
    generateCellIfNeeded(cell);
    revealCell(r, c, cellEl);
    // cascadeReveal(r, c, cellEl)
    // runSolverUntilStable()
  }
}



function revealCell(r, c, clickedCell) {
  // reveal
  let cell = ensureCell(r, c);
  if (cell.revealed || cell.flagged) return;

  // neighbours should be set ONCE (inside ensureCell ideally)
  //  if (!cell.neighbours) {
  //    cell.neighbours = getNeighbourCoords(r, c);
  //  }

  //  if (firstClick) {
  //    forbidMinesInRadius(clickedCell, 1);
  //    forceNumber(0);
  //    firstClick = false;
  //  }

  generateCellIfNeeded(cell);

  cell.revealed = true;
  clickedCell.classList.add("revealed");

  // 🔑 IMPORTANT: notify existing constraints FIRST
  //  notifyCellRevealed(r, c);

  if (cell.number > 0) {
    clickedCell.textContent = cell.number;
  } else {
    zeroFlood(r, c);
  }

  if (cell.mineState === MineState.MINE) {
    triggerGameOver();
    return;
  }

  applySoftMines();
}



function notifyCellRevealed(r, c) {
  // reveal
  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    let n = board.get(key(nr, nc));
    if (n?.constraint) {
      n.constraint.unknowns--;
      console.log("unknowns-- for", nr, nc, n.constraint.unknowns);
    }
  }
}

function decideNumber(r, c) {
  // reveal
  if (forcedFirstNumber !== null) {
    let n = forcedFirstNumber;
    forcedFirstNumber = null;
    return n;
  }

  let neighbours = getNeighbourCoords(r, c);

  let knownMines = 0;
  let unknowns = 0;
  let revealedNeighbours = 0;

  for (let [nr, nc] of neighbours) {
    let n = board.get(key(nr, nc));
    if (n?.mine === "mine") knownMines++;
    else if (!n || !n.revealed) unknowns++;
    else revealedNeighbours++;
  }

  // 1️⃣ Deep empty space → zero
  if (revealedNeighbours <= 1 && unknowns >= 4) {
    return knownMines;
  }

  // 2️⃣ Soft frontier → still zero
  if (unknowns >= 5) {
    return knownMines;
  }

  // 3️⃣ Tight frontier → introduce pressure
  if (unknowns <= 3) {
    return knownMines + 1;
  }

  // 4️⃣ Constraint overlap → stronger pressure
  let pressure = 0;

  for (let [nr, nc] of neighbours) {
    let n = board.get(key(nr, nc));
    if (n?.constraint) {
      let remaining = n.constraint.total - n.constraint.minesPlaced;
      let unk = n.constraint.unknowns;
      if (unk <= remaining + 1) pressure++;
    }
  }

  if (pressure >= 2) {
    return knownMines + 2;
  }

  return knownMines;
}

function getFrontierCells() {
  let frontier = [];

  for (let cell of board.values()) {
    if (!cell.revealed) continue;

    for (let [r, c] of cell.neighbours) {
      let n = board.get(key(r, c));
      if (!n || (!n.revealed && !n.flagged)) {
        frontier.push([r, c]);
      }
    }
  }
  return frontier;
}

function chordCell(clickedRow, clickedCol) {
  let cell = ensureCell(clickedRow, clickedCol);
  if (!cell.revealed || cell.adjacent == 0) return;
  let flagged = 0;
  let hidden = [];
  for (let [nr, nc] of cell.neighbours) {
    let neighbour = ensureCell(nr, nc);
    if (neighbour.flagged) flagged++;
    else if (!neighbour.revealed) hidden.push([nr, nc]);
  }
  if (flagged == cell.adjacent) {
    hidden.forEach(([nr, nc]) => {
      let el = document.getElementById(`cell-${nr}-${nc}`);
      if (!el) return;
      revealCell(nr, nc, el);
    });
  }
}

function solverPass(board) {
  let changed = false;

  for (let cell of board.getAllRevealedNumberCells()) {
    let neighbours = cell.neighbours;

    let knownMines = 0;
    let unknowns = [];

    for (let n of neighbours) {
      if (n.mineState == MineState.UNKNOWN) {
        unknowns.push(n);
      }
    }

    // Rule 1: if all unknowns are mines
    if (cell.number - knownMines == unknowns.length && unknowns.length > 0) {
      for (let u of unknowns) {
        if (u.mineState != MineState.MINE) {
          u.mineState = MineState.MINE;
          changed = true;
        }
      }
    }
    // Rule 2: if all unknowns are safe
    if (knownMines == cell.number && unknowns.length > 0) {
      for (let u of unknowns) {
        if (u.mineState != MineState.SAFE) {
          u.mineState = MineState.SAFE;
          changed = true;
        }
      }
    }
  }
  return changed;
}

function triggerGameOver() {
  gameOver = true;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let cellData = ensureCell(r, c);
      let cellElement = document.getElementById(`cell-${r}-${c}`);
      if (!cellElement) return;

      if (cellData.mine) {
        cellData.revealed = true;
        cellElement.classList.add("mine");
        cellElement.textContent = "💣"; // add flag
      }
    }
  }
}

function resetGame(newSize = size) {
  size = newSize;
  document.getElementById("feedback").textContent = "";
  board = new Map();
  //  generateBoard(size);
  document.getElementById("grid").innerHTML = "";
  generateGrid(size);
  //  firstClick = true;
  gameOver = false;
  attachListeners();
}

function toggleFlag(e) {
  if (gameOver) return;
  let clickedCell = e.target;
  e.preventDefault();
  let clickedRow = parseInt(clickedCell.dataset.row);
  let clickedCol = parseInt(clickedCell.dataset.col);
  let cell = ensureCell(clickedRow, clickedCol);
  if (cell.revealed == true) {
    return;
  } else if (cell.flagged) {
    cell.flagged = false;
    clickedCell.textContent = ""; // no flag
    clickedCell.classList.remove("flagged");
  } else {
    cell.flagged = true;
    clickedCell.textContent = "🚩"; // add flag
    clickedCell.classList.add("flagged");
  }
}



function forceReveal(r, c) {
  let cell = ensureCell(r, c);
  if (cell.revealed || cell.flagged) return;
  let el = document.getElementById(`cell-${r}-${c}`);
  if (!el) return;
  revealCell(r, c, el);
}



function getUnknownNeighbours(cell) {
  return cell.neighbours.filter(([r, c]) => {
    let n = board.get(key(r, c));
    return !n || (!n.revealed && !n.flagged);
  });
}

function getRemainingInfo(cell) {
  let unknowns = [];
  let mines = 0;

  for (let [r, c] of cell.neighbours) {
    let n = board.get(key(r, c));
    if (!n) continue;

    if (n.mineState === MineState.MINE) mines++;
    else if (!n.revealed) unknowns.push(n);
  }

  return {
    remaining: cell.number - mines,
    unknowns,
  };
}

function applySoftMines() {
  let changed = false;

  for (let cell of board.values()) {
    if (!cell.revealed || cell.number === 0) continue;

    let { remaining, unknowns } = getRemainingInfo(cell);

    if (remaining === unknowns.length && remaining > 0) {
      for (let u of unknowns) {
        if (u.mineState !== MineState.MINE) {
          u.mineState = MineState.MINE;
          changed = true;

          let el = getTd(u.x, u.y);
          if (el) el.classList.add("soft-mine");
        }
      }
    }
  }

  return changed;
}



function getNeighbourCoords(r, c) {
  let neighbours = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr == 0 && dc == 0) continue;
      let neighbourRow = r + dr;
      let neighbourCol = c + dc;

      neighbours.push([neighbourRow, neighbourCol]);
    }
  }
  return neighbours;
}



function forceNumber(n) {
  forcedFirstNumber = n;
}


function getTd(r, c) {
  return document.getElementById(`cell-${r}-${c}`);
}

function zeroFlood(startR, startC) {
  let queue = [[startR, startC]];
  let visited = new Set();

  while (queue.length > 0) {
    let [r, c] = queue.shift();
    let k = key(r, c);
    if (visited.has(k)) continue;
    visited.add(k);

    let cell = ensureCell(r, c);
    if (!cell.revealed) {
      let el = getTd(r, c);
      if (!el) continue;
      revealCell(r, c, el);
    }

    if (cell.number != 0) continue;

    for (let [nr, nc] of cell.neighbours) {
      let n = ensureCell(nr, nc);
      if (n.flagged || n.revealed) continue;

      let el = getTd(nr, nc);
      if (!el) continue;

      revealCell(nr, nc, el);

      if (n.number == 0) {
        queue.push([nr, nc]);
      }
    }
  }
  applySoftMines();
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
    resetGame(size);
  });
  document.getElementById("hintBtn").addEventListener("click", () => {
    revealHint();
  });

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
        let cellData = ensureCell(r, c);

        handleClicks(r, c, cell);
      }
    });
  });
}

function onClick(e) {
  if (!e.target.classList.contains("cell")) return;
  let cellEl = e.target;
  let x = parseInt(cellEl.dataset.row);
  let y = parseInt(cellEl.dataset.col);
  handleClicks(x, y, cellEl);
}


function key(x, y) {
  return `${x},${y}`;
}

function getCell(x, y) {
  return board.get(key(x, y));
}

function setCell(x, y, cell) {
  board.set(key(x, y), cell);
}

function ensureCell(x, y) {
  if (!board.has(key(x, y))) {
    board.set(key(x, y), createEmptyCell(x, y));
  }
  return board.get(key(x, y));
}

let MineState = {
  UNKNOWN: 0,
  SAFE: 1,
  MINE: 2,
};

function createEmptyCell(x, y) {
  return {
    x,
    y,
    mineState: MineState.UNKNOWN,
    revealed: false,
    number: null, // don't use adjacent as well. this is number to be shown
    flagged: false,
    neighbours: getNeighbourCoords(x, y),
  };
}

function generateCellIfNeeded(cell) {
  if (cell.number != null) return;
  if (cell.mineState != MineState.UNKNOWN) return;

  // TEMP: no mines yet, just numbers
  cell.mineState = MineState.SAFE;
  cell.number = decideNumber(cell.x, cell.y);
}

// ==== HINT SYSTEM (incomplete) ====

function getHintCandidates() {
  let candidates = new Map();

  for (let cell of board.values()) {
    if (!cell.revealed || cell.number === 0) continue;

    let unknowns = [];

    for (let [r, c] of cell.neighbours) {
      let n = board.get(key(r, c));
      if (!n || (!n.revealed && !n.flagged)) {
        unknowns.push([r, c]);
      }
    }

    if (unknowns.length === 0) continue;

    let risk = cell.number / unknowns.length;

    for (let [r, c] of unknowns) {
      let k = key(r, c);
      if (!candidates.has(k)) {
        candidates.set(k, []);
      }
      candidates.get(k).push(risk);
    }
  }

  return candidates;
}

function scoreCandidates(candidates) {
  let scores = [];

  for (let [k, risks] of candidates.entries()) {
    let score = Math.max(...risks); // worst-case pressure
    scores.push({ key: k, score });
  }

  scores.sort((a, b) => a.score - b.score);
  return scores;
}

function revealHint() {
  let candidates = getHintCandidates();
  if (candidates.size === 0) return;

  let ranked = scoreCandidates(candidates);
  let best = ranked[0];

  let [r, c] = best.key.split(",").map(Number);
  let el = getTd(r, c);
  if (!el) return;

  el.classList.add("hint");
}
