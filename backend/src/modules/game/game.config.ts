export const TICK_MS = 5000; // 5s per tick for autoMiner
export const CLICK_COOLDOWN_MS = 5000; // 5s cooldown between clicks
export const BASE_CLICK = 1; // base coins per click
export const CLICK_BONUS_PER_LEVEL = 1; // +1 per superClick level
export const AUTO_RATE_PER_LEVEL = 1; // +1 per tick per autoMiner level

export function nextCost(up: 'autoMiner' | 'superClick', level: number) {
  return up === 'autoMiner'
    ? 10 * Math.pow(2, level)
    : Math.round(5 * Math.pow(1.75, level));
}
