// ==== GLOBALs + CONSTANTS ====

let playerPicks = [];
let playerMoney = 10000000;
let gameRunning = false;
let generatedNumbers = [];
// let currentRound = 1;
// let betOptions = [100, 1000, 10000, 100000, 1000000];
// let betIndex = 3;
let bet = 1;
// let roundOptions = [1, 5, 10, 20];
// let roundIndex = 2;
// let playRounds = roundOptions[roundIndex];
let roundInterval = 2000;
let drawInterval = 200;
let boardSize = 80

// ==== SOUNDS ====
const sfxDraw = new Audio("sounds/draw.ogg");
const sfxHit = new Audio("sounds/hit.ogg");
const sfxWin = new Audio("sounds/win.wav");
const sfxLose = new Audio("sounds/lose.wav");

// ==== INITIALISATION + GENERATION OF STUFF ====

document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
  generateGrid(boardSize)
  attachListeners();
  updateMoneyDisplay();
}

function generateGrid(boardSize) {
  let table = document.getElementById("table");
  table.innerHTML = "";

  for (let i = 1; i <= boardSize; i++) {
    const td = document.createElement("div");
    td.className = "cell";
    td.id = "cell" + i;
    td.textContent = i;
    table.appendChild(td);
  }
  // enableInputs();
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

function startGameLoop() {
  if (playerPicks.length === 0 || gameRunning) return;

  gameRunning = true;
  runRound();
}

function runRound() {
  resetBoard();

  generateWinners(() => {
    comparePicks();

    setTimeout(() => {
      runRound(); // no guards here
    }, roundInterval);
  });
}

function resetBoard() {
  let cells = document.querySelectorAll(".cell");
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
  let cells = document.querySelectorAll(".cell");
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

  // Play + clear
  document.getElementById("playBtn").addEventListener("click", () => {
    if (gameRunning) return; // prevent spam-click start
    startGameLoop();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (gameRunning) return;
    clearPicks();
  });
}


