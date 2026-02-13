// ==== CAMERA / ZOOM ===

function renderCamera() {
  let test = document.querySelector('.cell[data-row="0"][data-col="0"]');
  if (test) {
    test.style.background = "lime";
    test.textContent = "X";
  }

  let viewport = document.getElementById("viewport");

  let vw = viewport.clientWidth;
  let vh = viewport.clientHeight;

  let gridPx = viewSize * cellSize;

  let centerX = (vw - gridPx) / 2;
  let centerY = (vh - gridPx) / 2;

  camera.style.transform = `translate(${centerX}px, ${centerY}px)`;

  for (let sr = 0; sr < viewSize; sr++) {
    for (let sc = 0; sc < viewSize; sc++) {
      let wr = cameraR + sr;
      let wc = cameraC + sc;

      //    ensureCell(wr, wc);

      let cell = getCell(wr, wc); // board uses wr/wc
      // let cell = board.get(key(wr, wc))

      let el = document.querySelector(
        `.cell[data-row="${sr}"][data-col="${sc}"]`,
      ); // dOM is sr/sc

      if (!el) continue;

      // if (cell.revealed) {
      // el.classList.add("revealed")

      // if (cell.adjacent > 0) {
      // el.textContent = cell.adjacent
      // } else {
      // el.textContent = ""
      // }}

      //      if (!cell) { // unknown void
      // el.className = "cell"
      // el.textContent = ""
      // el.style.backgroundColor = "#bbb";
      // continue;
      // }

      drawCell(el, cell);
    }
  }
}

function moveCamera(dx, dy) {
  //  let cellSize = 30; // (set in css)

  dragAccumX += dx;
  dragAccumY += dy;

  let moveX = Math.trunc(dragAccumX / cellSize);
  let moveY = Math.trunc(dragAccumY / cellSize);

  if (moveX != 0) {
    cameraC -= moveX;
    dragAccumX -= moveX * cellSize;
  }

  if (moveY != 0) {
    cameraR -= moveY;
    dragAccumY -= moveY * cellSize;
  }

  if (moveX != 0 || moveY != 0) {
    renderCamera();
  }
}

function getCellFromScreen(x, y) {
  let el = document.elementFromPoint(x, y);
  if (!el || !el.classList.contains("cell")) return null;

  let sr = parseInt(el.dataset.row);
  let sc = parseInt(el.dataset.col);
  let wr = cameraR + sr;
  let wc = cameraC + sc;

  return getCell(wr, wc);
}

function zoomOut() {
  cellSize = Math.max(12, cellSize - 2);
  regenerateView();
}

function zoomIn() {
  cellSize = Math.max(60, cellSize + 2);
  regenerateView();
}