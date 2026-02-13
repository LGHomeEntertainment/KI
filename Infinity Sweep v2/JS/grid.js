// Only knows .cell, gridEl, cellSize. 
// Does not know mines

// visible GRID
function generateGrid(size) {
  gridEl.innerHTML = "";

  gridEl.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;

  for (let gridRow = 0; gridRow < size; gridRow++) {
    // let tr = document.createElement("tr");
    for (let gridCol = 0; gridCol < size; gridCol++) {
      let cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = gridRow;
      cell.dataset.col = gridCol;
      gridEl.appendChild(cell);
    }
  }
}

function drawCell(el, cell) {
  el.classList.remove("revealed", "flagged", "mine");
  el.textContent = "";
  el.style.backgroundColor = "";

  // FLAGGED (highest priority, unrevealed)
  if (cell.flagged && !cell.revealed) {
    el.classList.add("flagged");
    el.textContent = "🚩";
    return;
  }

  // REVEALED
  if (cell.revealed) {
    el.classList.add("revealed");

    if (cell.mine) {
      el.textContent = "💣";
      el.style.backgroundColor = "red";
      return;
    }

    if (cell.adjacent > 0) {
      el.textContent = cell.adjacent;
    }
  }
}

function regenerateView() {
  generateGrid(viewSize);
  attachGridListeners();
  renderCamera();
}