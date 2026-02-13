// ==== GLOBALs + CONSTANTS ====

let viewSize = 12;
let cellSize = 30;
let firstClick = true;
let board = new Map();
let gridEl = document.getElementById("grid");
let gameOver = false;
let cameraR = 0;
let cameraC = 0;
let startX = 0;
let startY = 0;
let touchMoved = false;
let touchTimer = null;
let isCameraMode = false;

let dragAccumX = 0;
let dragAccumY = 0; // so that not every small movement will cause camera to move

let deathCount = 0;
let revealedCount = 0;

let camera = document.getElementById("camera");

let zoom = 1;
let camX = 0;
let camY = 0;

let viewport = document.getElementById("viewport");



