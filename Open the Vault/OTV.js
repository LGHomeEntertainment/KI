let answerPIN = []; // start empty, then push
let round = 1;
let gameOver = false;



function generatePIN() {
  answerPIN = [];
  for (let i = 0; i < 4; i++) {
    let digit = Math.floor(Math.random() * 10); // inside loop so that it keeps generating new digits to push in
    answerPIN.push(digit);
  }
}

disableAll();
enableCurrentRow();

generatePIN(); // call on it directly to create new pin

document.getElementById("submitBtn").addEventListener("click", checkAnswer);
document.getElementById("submitBtn").addEventListener("keydown", checkAnswer);

document.getElementById("resetBtn").style.display = "none";
document.getElementById("resetBtn").addEventListener("click", resetGame);

function disableAll() {
  let cells = document.querySelectorAll("input[type='tel']");
  cells.forEach((cell)=> {
    cell.disabled = true;
  });
}

function enableCurrentRow() {
  let row = document.querySelector(`tr[data-guess="${round}"]`);
  let rowCells = row.querySelectorAll("input");
  rowCells.forEach((cell, index) => {
    cell.disabled = false;

// auto advance input
cell.addEventListener('input', () => {
if (cell.value.length == 1 && index < 3) {
rowCells[index + 1].focus()
}
})

// backspace
cell.addEventListener("keydown", (e) => {
  if (e.key == "Backspace" && index > 0 && cell.value == "") {
    rowCells[index - 1].focus()
}
})

// enter
cell.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && index == 3 && cell.value.length == 1) {
    checkAnswer()
}
})
})

let firstInput = document.querySelector(`tr[data-guess="${round}"] input[type='tel']`); // calculated every round, so inside the loop
if (firstInput) {
  firstInput.focus()
}
}

function checkAnswer() {
  let currentRow = document.querySelector(`tr[data-guess="${round}"]`);
  let guess = [];
  for (let i = 0; i < 4; i++) {
    let cell = document.getElementById(`guess${round}-${i}`);
    let cellValue = cell.querySelector("input");

    if (cellValue.value == "") {
      document.getElementById("feedback").textContent = "Please key in 4 digits";
      return;
    } else {
      guess.push(parseInt(cellValue.value));
    }
  }
  for (let i = 0; i < 4; i++) {
    let cell = document.getElementById(`guess${round}-${i}`);
    if (guess[i] == answerPIN[i]) {
      // change bg color
      cell.style.backgroundColor = "green";
    } else if (answerPIN.includes(guess[i])) {
      // diff colours
      cell.style.backgroundColor = "yellow";
    } else {
      cell.style.backgroundColor = "gray";
    }
  }
  disableAll()
  if (guess[0] == answerPIN[0] && guess[1] == answerPIN[1] && guess[2] == answerPIN[2] && guess[3] == answerPIN[3]) {
    gameOver = true;  
    document.getElementById("resetBtn").style.display = "inline-block";
    document.getElementById("submitBtn").style.display = "none";
  } else if (round < 4) {
    round++;
  enableCurrentRow();
  } else {
    gameOver = true;
    document.getElementById("resetBtn").style.display = "inline-block";
    document.getElementById("submitBtn").style.display = "none";
  }
}

function resetGame() {
  document.getElementById("resetBtn").style.display = "none";
  document.getElementById("feedback").textContent = "";
  // clear cell contents too!!!
  let cells = document.querySelectorAll("input[type='tel']");
     cells.forEach((cell) => {
    cell.value = "";
  });
  let cellColor = document.querySelectorAll("td");
cellColor.forEach((x) => {
x.style.backgroundColor = "transparent"; //reset colour too!!!
})
  generatePIN();
  round = 1;
  gameOver = false;
  enableCurrentRow();
  document.getElementById("submitBtn").style.display = "block";
}