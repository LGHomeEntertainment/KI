const computerInput = ["papers", "scissors", "rocks"];

let round = 1;
let playerScore = 0;
let computerScore = 0;

document.getElementById("scissors").addEventListener("click", checkAnswer);
document.getElementById("rocks").addEventListener("click", checkAnswer);
document.getElementById("papers").addEventListener("click", checkAnswer);
document.getElementById("resetBtn").style.display = "none";
document.getElementById("resetBtn").addEventListener("click", resetGame);

function checkAnswer(e) {
  let computerRandom = Math.floor(Math.random() * 3); // this gives 0, 1, 2.9999, so with floor, gives 0, 1, 2.. aka computerInput array
  let computerChoice = computerInput[computerRandom];
  const playerChoice = e.target.id; // gets the id of the image clicked
  if (round <= 5) {
    if (playerChoice == computerChoice) {
      document.getElementById("feedback").textContent = "It's a tie!";
      document.getElementById("resetBtn").style.display = "inline-block";
    } else if (
      (playerChoice == "rocks" && computerChoice == "scissors") ||
      (playerChoice == "scissors" && computerChoice == "papers") ||
      (playerChoice == "papers" && computerChoice == "rocks")
    ) {
      document.getElementById(
        "feedback"
      ).textContent = `Your ${playerChoice} won against Computer's ${computerChoice}`;
      document.getElementById("resetBtn").style.display = "inline-block";
      playerScore++;
    } else {
      document.getElementById(
        "feedback"
      ).textContent = `Your ${playerChoice} lost to ${computerChoice}`;
      document.getElementById("resetBtn").style.display = "inline-block";
      computerScore++;
    }
    document.getElementById("computer").src = `${computerChoice}.png`; // or whatever the link of the 3 choices image is.
    document.getElementById("player").src = `${playerChoice}.png`; // or whatever the link of the 3 choices image is.
    round++;
    if (round > 5) {
      if (playerScore > computerScore) {
        document.getElementById(
          "feedback"
        ).textContent = `Final score: ${playerScore} : ${computerScore}. You win!`;
      } else if (playerScore < computerScore) {
        document.getElementById(
          "feedback"
        ).textContent = `Final score: ${playerScore} : ${computerScore}. You lose!`;
      } else {
        document.getElementById(
          "feedback"
        ).textContent = `Final score: ${playerScore} : ${computerScore}. You win!`;
      }
    }
  }
}

function resetGame() {
  document.getElementById("resetBtn").style.display = "none";
  document.getElementById("feedback").textContent = "";
  computerRandom = Math.floor(Math.random() * 3);
  document.getElementById("computer").src = "robot.png"; // need to change
  document.getElementById("player").src = "player.png";
  computerScore = 0;
  playerScore = 0;
  round = 1;
}
