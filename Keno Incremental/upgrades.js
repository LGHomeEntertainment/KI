const upgrades = {
  fasterDraw: {
    cost: 1000,
    owned: false,
  },
  autoPlay: {
    cost: 10000,
    owned: false,
  },
  autoPick: {
    cost: 10000,
    owned: false,
  },
};

function applyUpgrades() {
  roundsUpgrade = gameState.upgrades.autoPlay == true;
}

function getDrawInterval() {
  return Math.max(200, baseDrawInterval - gameState.upgrades.fasterDraw * 50); // upgrades to keep as a level so every level is -50
}

function refreshUpgradeUI() {
  const autoPlayBtn = document.getElementById("upgradeAutoPlay");
  const cost = upgrade_defs.autoPlay.cost;
  const owned = gameState.upgrades.autoPlay;

  const autoPickBtn = document.querySelector('[data-upgrade="autoPick"]');
  const costSpan = btn.querySelector(".cost");
  costSpan.textContent = `$${upgrades.autoPick.cost.toLocaleString()}`;

  btn.classList.remove("affordable", "locked", "maxed");
  btn.disabled = false;

  if (owned) {
    btn.classList.add("maxed");
    btn.querySelector(".cost").textContent = "MAX";
    btn.disabled = true;
    return;
  }

  if (gameState.currency.money >= cost) {
    btn.classList.add("affordable");
  } else {
    btn.classList.add("locked");
    btn.disabled = true;
  }
}

// ==== BUYING UPGRADES ====
function buyAutoPlay() {
  let cost = upgrade_defs.autoPlay.cost;

  if (gameState.upgrades.autoPlay) return; // either hide the button or change colour and disable it later
  if (gameState.currency.money < cost) return;

  gameState.currency.money -= cost;
  gameState.upgrades.autoPlay = true;

  roundsUpgrade = true;
  applyUpgrades();

  updateMoneyDisplay();
  saveGame();
}

function buyFasterDraw() {
  // affects speed of drawing numbers
  let def = upgrade_defs.fasterDraw;
  let level = gameState.upgrades.fasterDraw;

  if (level >= def.maxLevel) return; // instead of this, should change to check after buying. then disable if it is maxed

  const cost = Math.floor(def.baseCost * Math.pow(def.costScaling, level));

  if (gameState.currency.money < cost) return;

  gameState.currency.money -= cost;
  gameState.upgrades.fasterDraw++;

  updateMoneyDisplay();
  saveGame();
}

function buyMoneyMultiplier() {
  // first upgrade. will have prestige versions
  let def = upgrade_defs.payoutMultiplier;
  let level = gameState.upgrades.payoutMultiplier;

  //  if (level >= def.maxLevel) return; // no max level needed

  const cost = Math.floor(def.baseCost * Math.pow(def.costScaling, level));

  if (gameState.currency.money < cost) return;

  gameState.currency.money -= cost;
  gameState.upgrades.payoutMultiplier++;

  updateMoneyDisplay();
  saveGame();
}


// ==== PRESTIGE ====
function buyMoneyMultiplierVip() {
  let def = upgrade_defs.payoutMultiplier;
  let level = gameState.upgrades.payoutMultiplier;

  //  if (level >= def.maxLevel) return; // no max level needed

  const cost = Math.floor(def.baseCost * Math.pow(def.costScaling, level));

  if (gameState.currency.money < cost) return;

  gameState.currency.money -= cost;
  gameState.upgrades.payoutMultiplier++;

  updateMoneyDisplay();
  saveGame();
}