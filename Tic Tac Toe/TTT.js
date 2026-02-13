let board = ["", "", "", "", "", "", "", "", ""]; // 0–8
let aiBoard = [3, 1, 3, 1, 10, 1, 3, 1, 3];
let round = 1; // keeps track of which round, so that i know which player is it

// toggle to play vs computer
let aiMode = false; // flag for choosing either play with human or comp
let aiThinking = false; // flag for disabling inputs during AI's turn
document.getElementById("toggleAI").addEventListener("click", () => {
  aiMode = !aiMode; // This flips it: true becomes false, false becomes true
  document.getElementById("toggleAI").textContent = aiMode
    ? "Play vs Human"
    : "Play vs Computer";
  resetGame(); // Start fresh when switching modes
});

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

const cells = document.querySelectorAll("td"); // selects all td cells. easier to scale up cuz it loops all cells.
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => checkAnswer(index));
});

document.getElementById("resetBtn").style.display = "none";
document.getElementById("resetBtn").addEventListener("click", resetGame);

let gameOver = false;

function checkAnswer(index) {
  let currentPlayer = round % 2 === 0 ? "O" : "X"; // current player set based on round number
  if (aiThinking) {
    return;
  }
  if (gameOver === true) {
    return;
    // check if cell is empty
  } else if (board[index] !== "") {
    return;
  } else {
    // not empty => text content = `${currentPlayer}`
    board[index] = currentPlayer; // cannot use  push cuz it'll add to the back of the array. should just update the index.
    document.getElementById(`cell-${index}`).textContent = currentPlayer;
    checkCombos(currentPlayer);
    if (gameOver) return;
  }
  round++;
  checkTie();
  if (aiMode == true && !gameOver) {
    aiThinking = true;

    document.getElementById("aiStatus").style.display = "block";
    setTimeout(() => {
      checkAnswerAI();
    }, 1000);
  }
}

function checkCombos(currentPlayer) {
  // check for wins
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      board[a] === currentPlayer &&
      board[b] === currentPlayer &&
      board[c] === currentPlayer
    ) {
      // currentPlayer wins!
      gameOver = true;
      document.getElementById("resetBtn").style.display = "inline-block";
      document.getElementById(
        "feedback"
      ).textContent = `${currentPlayer} wins!`;

      return;
    }
  }
}

function checkAnswerAI() {
  let currentPlayer = "O";
  let aiChoice = findWinningMove("O");
  if (aiChoice == null) {
    aiChoice = findWinningMove("X");
  }
  if (aiChoice == null) {
    // if still null, find best move based on board scoring
    let bestScore = -1;
    for (let i = 0; i < 9; i++) {
      if (board[i] == "" && aiBoard[i] > bestScore) {
        bestScore = aiBoard[i];
        aiChoice = i;
      }
    }
  }

  // just get a random place if nothing good at all
  if (aiChoice == null) {
    while (true) {
      aiChoice = Math.floor(Math.random() * 9);
      if (board[aiChoice] === "") {
        break; // found a valid move
      }
    }
  }
  board[aiChoice] = currentPlayer;
  document.getElementById(`cell-${aiChoice}`).textContent = currentPlayer;
  checkCombos(currentPlayer);
  round++;
  checkTie();

  aiThinking = false;
  document.getElementById("aiStatus").style.display = "none";
  return;
}

function checkTie() {
  let boardFull = true;
  for (let i = 0; i < 9; i++) {
    if (board[i] == "") {
      boardFull = false;
      break;
    }
  }
  if (boardFull && !gameOver) {
    gameOver = true;
    document.getElementById("resetBtn").style.display = "inline-block";
    document.getElementById("feedback").textContent = "It's a tie!";
  } else {
    document.getElementById("feedback").textContent = `Current player: ${
      round % 2 === 0 ? "O" : "X"
    }`;
  }
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  document.getElementById("resetBtn").style.display = "none";
  document.getElementById("feedback").textContent = "";
  // clear cell contents too!!!
  cells.forEach((cell) => {
    cell.textContent = "";
  });
  round = 1;
  gameOver = false;
}

function findWinningMove(player) {
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      // Temporarily place the move
      board[i] = player;

      // Check if this creates a win
      let isWin = false;
      for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] === player && board[b] === player && board[c] === player) {
          isWin = true;
          break;
        }
      }

      // Undo the temporary move
      board[i] = "";

      // If it was a winning move, return it
      if (isWin) return i;
    }
  }
  return null; // No winning move found
}
