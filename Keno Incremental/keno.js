// ==== GAME LOGIC (pure Keno) ====

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
  let count = 1;

  function generateNext() {
    if (count >= drawnNumbers) {
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
    setTimeout(generateNext, getDrawInterval());
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
  gameState.currency.money += winnings;
  updateMoneyDisplay();
}

function playGame() {
  if (gameRunning) return;
  if (playerPicks.length == 0) return; // || playerPicks.length < 10
  
  gameRunning = true;
  disableInputs();
  
  if (!gameState.upgrades.autoPlay) {
    resetBoard();
    document.getElementById("feedback").textContent = "";
    singleRound();
  } else {
    autoPlay = true
    multipleRounds();
  }
}

function singleRound() {
  generateWinners(() => {
    comparePicks();

    gameRunning = false
    enableInputs()
  });
  return;
}

function multipleRounds() {
  if (!autoPlay) return;
  updateMoneyDisplay();
  resetBoard();
  document.getElementById("feedback").textContent = feedbackText;
  
  generateWinners(() => {
    comparePicks();
    setTimeout(() =>  {
      if (autoPlay) { 
        multipleRounds()
      }
    }, roundInterval); // pause between rounds
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
  document.getElementById("moneyDisplay").textContent =
    `Money: $${gameState.currency.money.toLocaleString()}`;
}

function clearPicks() {
  let cells = document.querySelectorAll("td");
  cells.forEach((cell) => {
    cell.classList.remove("hit", "drawn", "picked");
  });
  playerPicks = [];
  generatedNumbers = [];
}

function stopAutoPlay() {
  autoPlay = false;
  gameRunning = false
  enableInputs()
}
  
