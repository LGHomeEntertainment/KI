// ==== GAME LOGIC ====

// player picking numbers. numbers are circled.
function toggleCell(e) {
  if (gameState.running) return;
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
  if (playerPicks.length === 0 || gameState.running) return;

  gameState.running = true;
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
    // to clear generated winners
  let cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.classList.remove("hit", "drawn");
  });
  generatedNumbers = [];
}

function clearPicks() {
    // to clear player picks
  let cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.classList.remove("hit", "drawn", "picked");
  });
  playerPicks = [];
  generatedNumbers = [];
}