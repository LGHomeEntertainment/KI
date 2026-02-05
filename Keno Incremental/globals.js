// ==== GLOBALs + CONSTANTS ====

let playerPicks = [];
// let playerMoney = 0;
let bet = 1; // upgradeable so that win more per round
let gameRunning = false;
let generatedNumbers = [];

// ==== UPGRADABLES ==== (those in brackets are KIV)
// let winningMultiplier = 1; // each next one is 2x
let roundInterval = 3000; // for between rounds each subsequent upgrade is -50. floor is 1000?
let baseRoundInterval = 3000;
// let drawInterval = 1000; // each subsequent upgrade is -50. floor is 200
let baseDrawInterval = 1000; // for number
let drawnNumbers = 10; // ++, max 20? increases the chance of winning
let baseDrawnNumbers = 10
let baseBoardSize = 80
let boardSize = 80; // -10 per upgrade, to 40? keep drawnnumbers as well? then much higher chance of winning

// ==== AUTOMATION ====
// let roundsUpgrade (now autoPlay) = false; // just one upgrade to continuous. then it allows for round interval upgrades
// let autoPick = false; // player can choose own 10 numbers, or toggle on or off for auto pick 10 numbers for every round? or make it asshole-y and first upgrade is autopick but it's for every round, then next one is to keep the numbers from the previous round.
// let autoCollect = false; // collects the round's currencyB

// all the upgrades. Do not use let for every single upgrade
// those above this should be removed eventually
let upgrade_defs = {
  autoPlay: {
    type: "boolean", // can only be true or false
    cost: 1000,
  },
  autoCollectB: {
    type: "boolean",
    cost: 50000,
  },
  fasterDraw: {
    type: "level", // best to have a formula or something to scale up difficulty later
    baseCost: 100,
    costScaling: 1.5, // optional, but nice
    maxLevel: 20,
  },
  winMultiplier: {
    type: "level",
    baseCost: 200,
    costScaling: 2,
  },
  roundInterval: {
    type: "level", // best to have a formula or something to scale up difficulty later
    baseCost: 1000,
    costScaling: 1.5, // optional, but nice
    maxLevel: 20,
  },
};

// ==== NOTES ====
// currencyA = winning $, unlocks upgrades. updated as gameState.currency.money
// currencyB = points? for automation. can be autocollected
// currencyC = gold? for prestiging





// ==== GAME STATE ====
// Keeps all status. Read and write to this, calculate based on this
const gameState = {
  currency: {
    money: 10000,
    prestige: 0,
  },

  upgrades: {
    autoPlay: false,
    //   autoPick: false,
    fasterDraw: 0, // level, not ms
    //   fasterRounds: 0,  // level
    //    ballsDrawn: 10,    // starts at 10, upgrades increase
    boardSize: 80,
  },

  //  stats: {
  //     totalRounds: 0,
  //    totalWins: 0,
  //  }
};






// ==== SOUNDS ====
const sfxDraw = new Audio("Sounds/draw.ogg");
const sfxHit = new Audio("Sounds/hit.ogg");
const sfxWin = new Audio("Sounds/win.wav");
const sfxLose = new Audio("Sounds/lose.wav");