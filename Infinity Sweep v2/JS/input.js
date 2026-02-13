// ==== ALL LISTENERS ====
// ==== UI + INTERACTION ====s

function onClick(e) {
  let sr = parseInt(e.target.dataset.row);
  let sc = parseInt(e.target.dataset.col);

  let wr = cameraR + sr;
  let wc = cameraC + sc;
  let cell = getCell(wr, wc);
  if (cell.revealed) {
    chordCell(wr, wc);
  } else {
    revealCell(wr, wc);
  }
  renderCamera();
}

function attachGlobalListeners() {
  // attach only once after page loads
  document.getElementById("resetBtn").addEventListener("click", resetGame);
  document.getElementById("zoomOutBtn").addEventListener("click", zoomOut);
  document.getElementById("zoomInBtn").addEventListener("click", zoomIn);
viewport.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
  document.addEventListener("keydown", keyboardKeys);
}

function attachGridListeners() {
  // reattach after zoom / new game etc
  // all my listeners
  let cells = document.querySelectorAll(".cell");

  // Left click
  cells.forEach((cell) => {
    cell.addEventListener("click", onClick);
  });

  // Right click
  gridEl.addEventListener("mousedown", (e) => {
    if (e.button !== 2) return;

    let cell = e.target.closest(".cell");
    if (!cell) return;

    let sr = Number(cell.dataset.row);
    let sc = Number(cell.dataset.col);

    toggleFlag(sr, sc);
  });

  // cells.forEach((cell) => {
  //   cell.addEventListener("contextmenu", (e) => {
  //     e.preventDefault();
  //     let sr = parseInt(cell.dataset.row);
  //     let sc = parseInt(cell.dataset.col);

  //     toggleFlag(sr, sc);
  //   });
  // });

  // Grid movement (for mobile camera)

  // touchstart
  gridEl.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length == 2) {
        // camera mode
        isCameraMode = true;
        touchMoved = false;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        return;
      }

      if (e.touches.length == 1) {
        isCameraMode = false;
        touchMoved = false;

        let touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        // long press = flag
        touchTimer = setTimeout(() => {
          let cell = getCellFromScreen(touch.clientX, touch.clientY);
          if (cell) {
            toggleFlag(cell.r, cell.c);
          }
        }, 450);
      }
    },
    { passive: false },
  );

  // touchmove
  gridEl.addEventListener(
    "touchmove",
    (e) => {
      touchMoved = true;

      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }

      // Only 2 fingers move camera
      if (isCameraMode && e.touches.length == 2) {
        let dx = e.touches[0].clientX - startX;
        let dy = e.touches[0].clientY - startY;

        moveCamera(dx, dy);

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }

      e.preventDefault();
    },
    { passive: false },
  );

  // touchend
  gridEl.addEventListener(
    "touchend",
    (e) => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }

      // single tap --> reveal
      if (!touchMoved && !isCameraMode) {
        let touch = e.changedTouches[0];
        let cell = getCellFromScreen(touch.clientX, touch.clientY);

        if (cell) {
          revealCell(cell.r, cell.c);
        }
      }
      isCameraMode = false;
    },
    { passive: false },
  );
}

// Camera movement
function keyboardKeys(e) {
  if (e.key === "ArrowUp" || e.key === "w") cameraR--;
  if (e.key === "ArrowDown" || e.key === "s") cameraR++;
  if (e.key === "ArrowLeft" || e.key === "a") cameraC--;
  if (e.key === "ArrowRight" || e.key === "d") cameraC++;
  renderCamera();
}
