// ==== GLOBALs + CONSTANTS ====

let playerPicks = [];
let playerMoney = 10000000;
let gameRunning = false;
let generatedNumbers = [];
let currentRound = 1;
let betOptions = [100, 1000, 10000, 100000, 1000000];
let betIndex = 3;
let bet = betOptions[betIndex];
let roundOptions = [1, 5, 10, 20];
let roundIndex = 2;
let playRounds = roundOptions[roundIndex];
let roundInterval = 2000;
let drawInterval = 200;

// ==== SOUNDS ====
const sfxDraw = new Audio("sounds/draw.ogg");
const sfxHit = new Audio("sounds/hit.ogg");
const sfxWin = new Audio("sounds/win.wav");
const sfxLose = new Audio("sounds/lose.wav");

// ==== INITIALISATION + GENERATION OF STUFF ====

document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  console.log("Initialising...");
  attachListeners();
  updateBetDisplay();
  updateRoundDisplay();
  updateMoneyDisplay();
}

// ==== CUSTOMISATION/SETTINGS (shared function) ====

function updateBetDisplay() {
  updateSettingsDisplay(
    betIndex,
    betOptions,
    "betDisplay",
    "lowerBet",
    "increaseBet"
  );
}

function updateRoundDisplay() {
  updateSettingsDisplay(
    roundIndex,
    roundOptions,
    "roundsDisplay",
    "fewerRounds",
    "moreRounds"
  );
}

function adjustBet(e) {
    console.log("Adjusting bet...");
  betIndex = adjustSetting(
    e,
    betIndex,
    betOptions,
    updateBetDisplay,
    "lowerBet",
    "increaseBet"
  );
  bet = betOptions[betIndex];
}

function adjustRounds(e) {
  roundIndex = adjustSetting(
    e,
    roundIndex,
    roundOptions,
    updateRoundDisplay,
    "fewerRounds",
    "moreRounds"
  );
  playRounds = roundOptions[roundIndex];
}

function updateSettingsDisplay(index, options, displayId, downId, upId) {
  let value = options[index];
  if (displayId == "betDisplay") {
    value = "$" + value.toLocaleString();
  }
  document.getElementById(displayId).textContent = value;

  // Disable buttons at the ends
  let atMin = index == 0;
  let atMax = index == options.length - 1;

  let downBtn = document.getElementById(downId);
  let upBtn = document.getElementById(upId);

  downBtn.disabled = atMin;
  downBtn.style.opacity = atMin ? 0.5 : 1;

  upBtn.disabled = atMax;
  upBtn.style.opacity = atMax ? 0.5 : 1;
}

function adjustSetting(e, index, options, updateDisplayFn, lowerId, upperId) {
  let id = e.currentTarget.id;

  if (id == lowerId && index > 0) {
    index--;
  } else if (id == upperId && index < options.length - 1) {
    index++;
  }
  updateDisplayFn();
  return index; // return index to be stored
}

// ==== GAME LOGIC ====

// player picking numbers. numbers are circled.
function toggleCell(e) {
  if (gameRunning) return;
  let clickedCell = e.target;
  let pickValue = parseInt(clickedCell.id.replace("cell", ""));

  // if already picked
  if (clickedCell.classList.contains("picked")) {
    clickedCell.classList.remove("picked");
    playerPicks = playerPicks.filter((n) => n !== pickValue);
  } else {
    if (playerPicks.length >= 10) return;
    clickedCell.classList.add("picked");
    playerPicks.push(pickValue);
  }
}

// comp generating winning numbers
function generateWinners(onFinish) {
  generatedNumbers = []; // need this to reset for the round
  let count = 0;

  function generateNext() {
    if (count >= 10) {
      onFinish(); // trigger next round only after 10 numbers are generated
      return;
    }

    let num = Math.ceil(Math.random() * 80);
    if (!generatedNumbers.includes(num)) {
      generatedNumbers.push(num);
      let cell = document.getElementById("cell" + num);

      if (cell) {
        // diff sounds and display
        if (cell.classList.contains("picked")) {
          sfxHit.currentTime = 0;
          sfxHit.play();
          cell.classList.add("hit");
        } else {
          sfxDraw.currentTime = 0;
          sfxDraw.play();
          cell.classList.add("drawn");
        }
      }
      count++;
    }
    setTimeout(generateNext, drawInterval);
  }
  generateNext(); // first one to start off the chain
}

function comparePicks() {
  let hits = document.querySelectorAll(".hit").length;
  let hitIndex = hits - 1;
  let feedbackText = "";
  let picks = playerPicks.length;
  let payoutMultiplier = payoutTable[picks]?.[hitIndex] || 0;
  let winnings = bet * payoutMultiplier;

  if (winnings == 0) {
    sfxLose.currentTime = 0;
    sfxLose.play();
    feedbackText = `Sorry, you matched ${hits} number${
      hits === 1 ? "" : "s"
    }, which is not enough to win.`;
  } else if (winnings > 0) {
    sfxWin.currentTime = 0;
    sfxWin.play();
    feedbackText = `You won $${winnings.toLocaleString()} for matching ${hits} number${
      hits === 1 ? "" : "s"
    }!`;
  }
  // Update feedback in HTML
  document.getElementById("feedback").textContent = feedbackText;
  playerMoney += winnings;
  updateMoneyDisplay();
}

function multipleRounds() {
  if (playerPicks.length == 0) return;
  gameRunning = true;
  // disableInputs();
  currentRound = 1;

  // if currentround > 1 && < play rounds run resetboard!!
  function playNextRound() {
    if (playerMoney < bet) {
      document.getElementById("feedback").textContent =
        "You are broke. Bye bye.";
      gameRunning = false;
      enableInputs();
      return;
    }
    if (currentRound > playRounds) {
      gameRunning = false;
      enableInputs();
      return;
    }
    playerMoney -= bet;
    updateMoneyDisplay();
    resetBoard();
    generateWinners(() => {
      comparePicks();
      currentRound++;
      setTimeout(playNextRound, roundInterval); // pause between rounds
    });
  }
  playNextRound();
}

function resetBoard() {
  let cells = document.querySelectorAll("td");
  cells.forEach((cell) => {
    cell.classList.remove("hit", "drawn");
  });
  generatedNumbers = [];
}

function updateMoneyDisplay() {
  document.getElementById(
    "moneyDisplay"
  ).textContent = `Money: $${playerMoney.toLocaleString()}`;
}

function clearPicks() {
  let cells = document.querySelectorAll("td");
  cells.forEach((cell) => {
    cell.classList.remove("hit", "drawn", "picked");
  });
  playerPicks = [];
  generatedNumbers = [];
}

// ==== UI + INTERACTION ====

function attachListeners() {
  // Player cells
  document.getElementById("table").addEventListener("click", (e) => {
  if (!e.target.classList.contains("cell") || gameRunning) return;
  toggleCell(e);
});


  // Bet buttons
  document.querySelectorAll(".changeBet").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (gameRunning) return;
      adjustBet(e);
    });
  });

  // Round buttons
  document.querySelectorAll(".changeRounds").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (gameRunning) return;
      adjustRounds(e);
    });
  });

  // Play + clear
  document.getElementById("playBtn").addEventListener("click", () => {
    if (gameRunning) return; // prevent spam-click start
    multipleRounds();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (gameRunning) return;
    clearPicks();
  });
}


// ==== PAYOUT TABLE ====
let payoutTable = {
  1: [8],
  2: [2, 38],
  3: [2, 7, 80],
  4: [2, 3, 10, 300],
  5: [1.5, 3, 5, 50, 2000],
  6: [1.5, 2, 4, 10, 200, 4000],
  7: [0, 3, 10, 25, 150, 1000, 5000],
  8: [0, 2, 7, 20, 200, 500, 1000, 10000],
  9: [0, 2, 5, 10, 70, 200, 1000, 10000, 50000],
  10: [0, 1.5, 3, 10, 50, 500, 5000, 10000, 50000, 100000],
};
