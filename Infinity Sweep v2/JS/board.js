// Pure game data

function key(r, c) {
  return `${r},${c}`;
}

function getCell(r, c) {
  ensureCell(r, c);
  return board.get(key(r, c));
}

function ensureCell(r, c) {
  let k = key(r, c);
  if (!board.has(k)) {
    board.set(k, createEmptyCell(r, c));
  }
}

function createEmptyCell(r, c) {
  return {
    r,
    c,
    mine: null, // null/true/false
    revealed: false,
    adjacent: null,
    flagged: false,
    neighbours: null,
    dead: false,
    committed: false, // mine is final
    generated: false, // whether mine has been decided
  };
}

function decideCell(r, c) {
  ensureCell(r, c);
  let cell = getCell(r, c);

  if (cell.generated && cell.mine != null) return cell.mine;

  // check constraints from neighbours
  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    let neighbour = getCell(nr, nc);
    if (!neighbour) continue;
    if (!neighbour.revealed) continue;
    if (neighbour.adjacent == null) continue;

    let { mines, undecided } = countNeighbourState(nr, nc);
    let remaining = neighbour.adjacent - mines;

    // if all remaining must be mines --> forced mine
    if (remaining == undecided && undecided > 0) {
      cell.mine = true;
      //  cell.generated = true;
      // cell.committed = true
      return true;
    }
  }

  return null;
}

function computeAdjacent(r, c) {
  // can check and commit. CANNOT CHANGE numbers
  let cell = getCell(r, c);
  let count = 0;

  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    let n = getCell(nr, nc);

    // 🔥 force decision if still unknown
    if (n.mine === null) {
      decideCell(nr, nc);
    }

    if (n.mine == true) count++;
  }

  cell.adjacent = count;
  return count;
}

function propagateFrom(r, c) {
  let cell = getCell(r, c);
  if (!cell.revealed) return;
  if (cell.adjacent == null) return;

  let mines = 0;
  let undecided = [];

  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    let n = getCell(nr, nc);
    if (!n) continue;

    if (n.mine == true) mines++;
    else if (n.mine == null) undecided.push(n);
  }
  let remaining = cell.adjacent - mines;
  if (remaining < 0) return;

  // Rule 1: all remaining are mines
  if (remaining == undecided.length && remaining > 0) {
    undecided.forEach((n) => {
      n.mine = true;
      n.generated = true;
      n.committed = true;
      propagateFrom(n.r, n.c);
    });
  }

  // Rule 2: all remaining safe
  if (remaining == 0 && undecided.length > 0) {
    undecided.forEach((n) => {
      n.mine = false;
      n.generated = true;
      n.committed = true;
      propagateFrom(n.r, n.c);
    });
  }
}

function getNeighbourCoords(r, c) {
  let neighbours = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr == 0 && dc == 0) continue;

      neighbours.push([r + dr, c + dc]);
    }
  }
  return neighbours;
}

function ensureNeighbours(r, c) {
  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    ensureCell(nr, nc);
  }
}



function countNeighbourState(r, c) {
  let mines = 0;
  let undecided = 0;

  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    let n = getCell(nr, nc);
    if (!n) continue;

    if (n.mine == true) mines++;
    else if (n.mine == null) undecided++;
  }
  return { mines, undecided };
}

function resolveEntropy(cell) {
  let undecided = getNeighbourCoords(r, c)
    .map(([r, c]) => getCell(r, c))
    .filter((n) => n.mine === null);

  if (undecided.length === 0) return;

  // danger increases as player explores
  let danger = Math.min(revealedCount / 800, 1);
  let mineChance = 0.1 + danger * 0.15;

  for (let n of undecided) {
    if (Math.random() < mineChance) {
      n.mine = true;
      n.generated = true;
      n.committed = true;
    }
  }
}