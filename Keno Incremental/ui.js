// ==== UI + INTERACTION ====
// disable and enable to only affect play/clear. can buy, stop, music etc
function disableInputs() {
  document.getElementById("clearBtn").removeEventListener("click", clearPicks);

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.removeEventListener("click", toggleCell);
  });
}

function enableInputs() {
    document.getElementById("clearBtn").addEventListener("click", clearPicks);

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("click", toggleCell);
  });
}

function attachListeners() {
  enableInputs();

  // play!
  document.getElementById("playBtn").addEventListener("click", playGame);

  document.getElementById("clearBtn").addEventListener("click", clearPicks);
  document.getElementById("debugResetBtn").addEventListener("click", hardReset);

  // buttons for upgrades
  document
    .getElementById("upgradeAutoPlay")
    .addEventListener("click", buyAutoPlay);
   document
    .getElementById("upgradeDrawSpeed")
    .addEventListener("click", buyFasterDraw);
     document
    .getElementById("upgradeMultiplier")
    .addEventListener("click", buyMoneyMultiplier);
   document
    .getElementById("upgradeMultiplierVip")
    .addEventListener("click", buyMoneyMultiplierVip);
      
    
}