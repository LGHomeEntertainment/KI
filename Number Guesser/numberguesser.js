let answer = Math.ceil(Math.random() * 100);
let guessCount = 1;
let jspreviousGuesses = []; // stores as array

document.getElementById("submitGuess").addEventListener("click", checkAnswer);
document.getElementById("resetBtn").style.display = "none";
document.getElementById("resetBtn").addEventListener("click", resetGame);

document.getElementById("numberGuess").addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    checkAnswer();
  }
});

const previousGuessesDiv = document.getElementById("previousGuesses"); // accesses the HTML div and displays it in the page

function checkAnswer() {
  const jsNumberGuess = document.getElementById("numberGuess").value;
  const guessNote = document.createElement("span"); // no need to add span to html, will auto add when i appendchild
  if (isNaN(jsNumberGuess) || 1 > jsNumberGuess || 100 < jsNumberGuess) {
    document.getElementById("feedback").textContent =
      "Please enter a valid guess";
    document.getElementById("numberGuess").value = "";
  } else if (jsNumberGuess == answer) {
    document.getElementById(
      "feedback"
    ).textContent = `You got it! (Guess #${guessCount})`;
    document.getElementById("resetBtn").style.display = "inline-block";
    document.getElementById("submitGuess").disabled = true;
    document.getElementById("numberGuess").disabled = true;
    guessNote.textContent = jsNumberGuess + " ";
    guessNote.style.color = "green";
    previousGuessesDiv.appendChild(guessNote);
  } else if (jsNumberGuess < answer) {
    document.getElementById(
      "feedback"
    ).textContent = `Too low (Guess #${guessCount})`;
    document.getElementById("numberGuess").value = "";
    guessCount += 1;
    guessNote.textContent = jsNumberGuess + " ";
    guessNote.style.color = "blue";
    previousGuessesDiv.appendChild(guessNote);
  } else {
    document.getElementById(
      "feedback"
    ).textContent = `Too high (Guess #${guessCount})`;
    document.getElementById("numberGuess").value = "";
    guessCount += 1;
    guessNote.textContent = jsNumberGuess + " ";
    guessNote.style.color = "red";
    previousGuessesDiv.appendChild(guessNote);
  }
}

function resetGame() {
  document.getElementById("numberGuess").value = "";
  document.getElementById("resetBtn").style.display = "none";
  document.getElementById("feedback").textContent = "";
  answer = Math.ceil(Math.random() * 100);
  guessCount = 1;
  previousGuessesDiv.textContent = "";
}
