// ==== GLOBALs + CONSTANTS ====

let size = 8; // start with 10, easier to adjust later
let totalMines = Math.floor(Math.random() * 16 + 10);
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

// function revealCell(r, c, clickedCell) { // old
//   let cell = ensureCell(r, c);
//   cell.neighbours = getNeighbourCoords(r, c);
//   if (cell.revealed) return;

//   if (firstClick) {
//     forbidMinesInRadius(clickedCell, 1);
//     forceNumber(0);
//     firstClick = false;
//   }

//   cell.revealed = true;
//   clickedCell.classList.add("revealed");

//   if (cell.adjacent == null) {
//     let n = decideNumber(r, c);
//     cell.adjacent = n;

//     let unknowns = cell.neighbours.filter(([nr, nc]) => {
//       let neigh = board.get(key(nr, nc));
//       return !neigh || !neigh.revealed;
//     }).length;

//     cell.constraint = {
//       total: n,
//       minesPlaced: 0,
//       unknowns,
//     };
//   }

//     notifyCellRevealed(r, c);

//   if (cell.adjacent > 0) {
//     clickedCell.textContent = cell.adjacent;
//     return;
//   } else {
//     cascadeReveal(r, c, new Set());
//   }
//   // setTimeout(runSolver, 0);
// }

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

  // runSolverUntilStable()
  applySoftMines();
}

function notifyMinePlaced(r, c) {
  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    let n = board.get(key(nr, nc));
    if (n?.constraint) {
      n.constraint.minesPlaced++;
      n.constraint.unknowns--;
    }
  }
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
    if (!cell.revealed || !cell.constraint) continue;

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

function resetGame(newSize = size, newMines = totalMines) {
  size = newSize;
  totalMines = newMines;
  document.getElementById("feedback").textContent = "";
  board = new Map();
  //  generateBoard(size);
  document.getElementById("grid").innerHTML = "";
  generateGrid(size);
  //  firstClick = true;
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

function placeMine(r, c) {
  // solver
  let cell = ensureCell(r, c);
  if (cell.flagged) return;

  cell.flagged = true;
  cell.mineState = MineState.MINE;

  let el = document.getElementById(`cell-${r}-${c}`);
  if (!el) return;
  if (el) el.classList.add("flagged");

  notifyMinePlaced(r, c);

  // Update constraints around it
  //   for (let [nr, nc] of getNeighbourCoords(r, c)) {
  //     let n = board.get(key(nr, nc));
  //     if (!n || !n.constraint) continue;
  //     n.constraint.minesPlaced++;
  //     n.constraint.unknowns--;
  //   }
  runSolverUntilStable();
}

function forceReveal(r, c) {
  let cell = ensureCell(r, c);
  if (cell.revealed || cell.flagged) return;
  let el = document.getElementById(`cell-${r}-${c}`);
  if (!el) return;
  revealCell(r, c, el);
}

// function runSolver() {
//   let changed;
//   let safety = 0;
//   do {
//     changed = false;
//     if (applyForcedMoves()) changed = true;
//     if (applySubsetLogic()) changed = true;

//     // No progress? Inject entropy ONCE
//     if (!changed) {
//       if (injectEntropy()) changed = true;
//     }

//     safety++;
//   } while (changed && safety < 100);
// }

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

// function applySubsetLogic() {
//   let progress = false;
//   let constrained = [...board.values()].filter(
//     (c) => c.revealed && c.constraint
//   );

//   for (let i = 0; i < constrained.length; i++) {
//     for (let j = 0; j < constrained.length; j++) {
//       if (i == j) continue;

//       let A = constrained[i];
//       let B = constrained[j];

//       let UA = getUnknownNeighbours(A);
//       let UB = getUnknownNeighbours(B);

//       if (UA.length == 0 || UB.length == 0) continue;
//       if (UA.length >= UB.length) continue;

//       // Check subset
//       let isSubset = UA.every(([r, c]) =>
//         UB.some(([rr, cc]) => rr == r && cc == c)
//       );
//       if (!isSubset) continue;

//       let RA = A.constraint.total - A.constraint.minesPlaced;
//       let RB = B.constraint.total - B.constraint.minesPlaced;

//       let diff = RB - RA;
//       let diffCells = UB.filter(
//         ([r, c]) => !UA.some(([rr, cc]) => rr == r && cc == c)
//       );

//       // Forced SAFE
//       if (diff == 0) {
//         diffCells.forEach(([r, c]) => forceReveal(r, c));
//         progress = true;
//       }

//       // Forced MINE
//       if (diff == diffCells.length) {
//         diffCells.forEach(([r, c]) => placeMine(r, c));
//         progress = true;
//       }
//     }
//   }
//   return progress;
// }

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

function forbidMinesInRadius(centerCell, radius) {
  let r = parseInt(centerCell.dataset.row);
  let c = parseInt(centerCell.dataset.col);

  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      let cell = ensureCell(r + dr, c + dc);
      cell.cannotBeMine = true;
    }
  }
}

function forceNumber(n) {
  forcedFirstNumber = n;
}

// function runSolverUntilStable() {
// let changed
// do{
// changed = false;
// if (applyBasicConstraints()) changed = true
// if (applySubsetConstraints()) changed = true
// } while (changed)
// }

// function applyBasicConstraints() {
// let progress = false

// for (let cell of board.values()) {
// if (!cell.revealed || !cell.constraint) continue

// let { total, minesPlaced, unknowns } = cell.constraint
// let remaining = total - minesPlaced
// if (unknowns == 0) continue

// let neighbours = getUnknownNeighbours(cell)

// // Rule 1: all Safe
// if (remaining == 0) {
// for (let [r, c] of neighbours) {
// forceReveal(r, c)
// progress = true
// }}

// // Rule 2: all mines
// if (remaining == neighbours.length) {
// for (let [r, c] of neighbours) {
// placeMine(r, c)
// progress = true
// }}
// }
// return progress
// }

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
    resetGame(size, totalMines);
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

function cascadeReveal(r, c, visited) {
  // reveal
  let k = key(r, c);
  if (visited.has(k)) return;
  visited.add(k);

  let cell = board.get(k);
  if (!cell || cell.revealed) return;

  revealCell(r, c, getTd(r, c));

  if (cell.adjacent === 0) {
    for (let [nr, nc] of cell.neighbours) {
      cascadeReveal(nr, nc, visited);
    }
  }
}

// function cascadeReveal(r, c, visited = new Set()) { // old
//   let k = key(r, c);
//   if (visited.has(k)) return;
//   visited.add(k);

//   for (let [nr, nc] of getNeighbourCoords(r, c)) {
//     let neigh = ensureCell(nr, nc);
//     if (neigh.revealed) continue;

//     let neighEl = document.getElementById(`cell-${nr}-${nc}`);
//     if (!neighEl) continue;
//     revealCell(nr, nc, neighEl);
//   }
// }

// ==== INFINITY HELPERS ====
// no longer set grid/board size. returns the exact coord of that cell

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

// function highlightCell(r, c) {
//   let cellElement = document.getElementById(`cell-${r}-${c}`);
//   cellElement.classList.add("hint");

//   // Remove highlight after short delay
//   setTimeout(() => {
//     cellElement.classList.remove("hint");
//   }, 1500);
// }

// function revealHint() {
//   let safeCell = findGuaranteedSafeCell();
//   if (safeCell) {
//     highlightCell(safeCell.r, safeCell.c);
//   } else {
//     document.getElementById("feedback").textContent =
//       "No guaranteed safe move.";
//   }
// }

// function findGuaranteedSafeCell() {
//   // incomplete hint system
//   for (let r = 0; r < size; r++) {
//     for (let c = 0; c < size; c++) {
//       let cell = ensureCell(r, c);
//       if (!cell.revealed || cell.adjacent == 0) continue;

//       for (let dr = -1; dr <= 1; dr++) {
//         for (let dc = -1; dc <= 1; dc++) {
//           if (dr == 0 && dc == 0) continue;
//           let neighbourRow = r + dr;
//           let neighbourCol = c + dc;

//           let neighbourCell = ensureCell(neighbourRow, neighbourCol);
//           // ****
//         }
//       }
//     }
//   }
// }

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
