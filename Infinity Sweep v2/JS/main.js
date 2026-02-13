// ==== INITIALISATION + GENERATION ====

document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  generateGrid(viewSize);
  console.log("cell count: ", document.querySelectorAll(".cell").length);
  attachGlobalListeners();
  attachGridListeners();
  renderCamera();
}

