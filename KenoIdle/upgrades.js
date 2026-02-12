let upgrades = {
  payoutMultiplier: {
    level: 0,
    baseCost: 1000,
    costMultiplier: 1.8,
    effectPerLevel: 0.25,
    maxLevel: 50,
    currency: "cash",
  },

  speed: {
    level: 0,
    baseCost: 2000,
    costMultiplier: 1.7,
    effectPerLevel: 0.1,
    maxLevel: 20,
    currency: "cash",
  },

  autoPick: {
    // keep as a prestige upgrade.
    level: 0,
    baseCost: 25,
    costMultiplier: 3,
    effectPerLevel: 1,
    maxLevel: 1, // boolean-style upgrade
    currency: "shards", // prestige currency, separate from cash
  },

  autoPlay: {
    level: 0,
    baseCost: 10000,
    costMultiplier: 3,
    effectPerLevel: 1,
    maxLevel: 1,
    currency: "cash",
  },

  //autoplay, speedupdraw, speedupround
  extraDraws: 0,

  // placeholders
  boardCount: 1,
  idleEfficiency: 1,
};

function getUpgradeCost(id) {
  const up = upgrades[id];
  return Math.floor(up.baseCost * Math.pow(up.costMultiplier, up.level));
}

function canBuyUpgrade(id) {
  const up = upgrades[id];
  if (!up) return false;
  if (up.maxLevel && up.level >= up.maxLevel) return false;

  const cost = getUpgradeCost(id);
  let currencyType = up.currency
  return currency[currencyType] >= cost;
}

function buyUpgrade(id) {
  const up = upgrades[id];
  if (!up) return;

  if (!canBuyUpgrade(id)) return;

  const cost = getUpgradeCost(id);

  up.level++;
  applyUpgradeEffects(id);

  changeCurrency("cash", -cost, "upgrade" + id);
}

function applyUpgradeEffects(id) {
  switch (id) {
    case "payoutMultiplier":
      // computed dynamically in payout.js
      break;

    case "speed":
      roundInterval = Math.max(300, 2000 * Math.pow(0.9, upgrades.speed.level));
      break;

    case "autoPick":
      // handled in game loop later
      break;
  }
}

function onUpgradeClick(id) {
  if (!canBuyUpgrade(id)) return;
  buyUpgrade(id);
  updateUpgradeUI(id);
}

// Helper functions (pure queries, called often)
function hasAutoPlay() {
  // called by game.js - runround()
  return upgrades.autoPlay.level > 0;
}
