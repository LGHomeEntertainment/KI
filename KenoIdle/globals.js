// ==== GLOBALs + CONSTANTS ====

let playerPicks = [];
let playerMoney = 10000000;
let generatedNumbers = [];

let bet = 1;
// let roundOptions = [1, 5, 10, 20];
// let roundIndex = 2;
// let playRounds = roundOptions[roundIndex];
let roundInterval = 2000;
let drawInterval = 200;
let boardSize = 80;

// ==== SOUNDS ====
const sfxDraw = new Audio("sounds/draw.ogg");
const sfxHit = new Audio("sounds/hit.ogg");
const sfxWin = new Audio("sounds/win.wav");
const sfxLose = new Audio("sounds/lose.wav");

// Core game state
let gameState = {
  running: false,

  totalRounds: 0,
  totalWins: 0,
};

let settings = {
  sound: true,
};
