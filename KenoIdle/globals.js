// ==== GLOBALs + CONSTANTS ====

let playerPicks = [];
let generatedNumbers = [];

let bet = 10;
let roundInterval = 2000;
let drawInterval = 200;
let boardSize = 80;

const currency = {
  cash: 10000000,
  shards: 0, // prestige later
  tickets: 0, // events / boosts later
};

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
