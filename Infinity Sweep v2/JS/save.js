// ==== SAVE GAME ====
function saveGame() {
  const data = {
    cells: Array.from(board.entries()),
    revealedCount,
    deathCount,
    firstClick,
  };

  localStorage.setItem("infiniteSweeperSave", JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem("infiniteSweeperSave");
  if (!raw) return;

  const data = JSON.parse(raw);

  board = new Map(data.cells);
  revealedCount = data.revealedCount;
  deathCount = data.deathCount;
  firstClick = data.firstClick;

  renderCamera();
  updateStats();
}
