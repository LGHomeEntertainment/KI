// ==== GAME LOGIC ====

function revealCell(r, c) {
  ensureCell(r, c);
  let cell = getCell(r, c);
  if (cell.revealed || cell.flagged) return;

  // if still undecided, then just guarantee safe
  // if (cell.mine == null) {
  //  cell.mine = false;
  //  cell.generated = true;
  // }

  if (!cell.generated && cell.mine == null) {
    cell.mine = false;
    cell.generated = true;
  }

  cell.revealed = true;

  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    let n = getCell(nr, nc);
    if (!n.generated && n.mine == null) {
      n.mine = Math.random() < 0.18;
      n.generated = true;
    }
  }

  revealedCount++;
  updateStats();

  if (cell.mine == true) {
    registerDeath(cell);
  }

  if (!firstClick) {
    //   resolveEntropy(cell);
  }

  if (cell.adjacent == null) {
    cell.adjacent = computeAdjacent(r, c);
  }
  propagateFrom(r, c);

  firstClick = false;

  // cascade
  if (cell.adjacent == 0) {
    for (let [nr, nc] of getNeighbourCoords(r, c)) {
      revealCell(nr, nc);
    }
  }
  // saveGame();
}

function toggleFlag(sr, sc) {
  let wr = cameraR + sr;
  let wc = cameraC + sc;

  let cell = getCell(wr, wc);
  if (cell.revealed) return;

  cell.flagged = !cell.flagged;
  renderCamera();
  //  saveGame();
}

function chordCell(r, c) {
  let cell = getCell(r, c);

  if (!cell.revealed || cell.adjacent == 0 || cell.adjacent == null) return;

  let flagged = 0;
  let hidden = [];

  for (let [nr, nc] of getNeighbourCoords(r, c)) {
    let n = getCell(nr, nc);

    if (n.flagged || (n.mine && n.revealed)) flagged++;
    else if (!n.revealed) hidden.push([nr, nc]);
  }
  if (flagged == cell.adjacent) {
    hidden.forEach(([nr, nc]) => {
      revealCell(nr, nc);
    });
  }
}

function resetGame() {
  console.log("game resetting")
  localStorage.removeItem("infiniteSweeperSave");
 // document.getElementById("feedback").textContent = "";
  document.getElementById("revealed").textContent = "Revealed:";
  document.getElementById("deaths").textContent = "Dead cells:";
  document.getElementById("integrity").textContent = "Integrity:";
  deathCount = 0;
  revealedCount = 0;
  board.clear();
  cameraR = 0;
  cameraC = 0;
  dragAccumX = 0;
  dragAccumY = 0;

  document.getElementById("grid").innerHTML = "";
  generateGrid(viewSize);
  firstClick = true;
  gameOver = false;
  attachGridListeners();
  renderCamera();
}

function registerDeath(cell) {
  if (cell.dead) return; // prevent double count
  cell.dead = true;
  deathCount++;
  updateStats();
}

function updateStats() {
  let integrity = 100;

  if (revealedCount > 0) {
    integrity = Math.floor((1 - deathCount / revealedCount) * 100);
  }
  document.getElementById("revealed").textContent =
    `Revealed: ${revealedCount}`;
  document.getElementById("deaths").textContent = `Dead cells: ${deathCount}`;
  document.getElementById("integrity").textContent = `Integrity: ${integrity}%`;
}

