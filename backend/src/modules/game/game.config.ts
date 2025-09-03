export const CLICK_COOLDOWN_MS = 5000; // 5s cooldown between clicks
export const BASE_CLICK = 1; // base coins per click

// Auto-miner intervals by level (in ms)
export const AUTO_MINER_INTERVALS = [0, 30000, 20000, 15000, 10000]; // Level 0-4

// Super-click coins by level
export const SUPER_CLICK_COINS = [1, 2, 3, 4, 5]; // Level 0-4

// Upgrade costs by level
export const AUTO_MINER_COSTS = [10, 100, 1000, 10000]; // Levels 1-4
export const SUPER_CLICK_COSTS = [5, 50, 500, 5000]; // Levels 1-4

export function getUpgradeCost(upgrade: 'autoMiner' | 'superClick', currentLevel: number): number | null {
  if (currentLevel >= 4) return null; // Max level reached
  
  const costs = upgrade === 'autoMiner' ? AUTO_MINER_COSTS : SUPER_CLICK_COSTS;
  return costs[currentLevel];
}
