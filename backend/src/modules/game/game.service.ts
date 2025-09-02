import { Injectable } from '@nestjs/common';
import { GameRepository } from './game.repository';
import { GameState, UpgradeType } from './game.types';
import {
  TICK_MS,
  CLICK_COOLDOWN_MS,
  BASE_CLICK,
  CLICK_BONUS_PER_LEVEL,
  AUTO_RATE_PER_LEVEL,
  nextCost,
} from './game.config';

@Injectable()
export class GameService {
  constructor(private readonly repo: GameRepository) {}

  private computeTicks(last: Date, now = new Date()) {
    return Math.floor((now.getTime() - last.getTime()) / TICK_MS);
  }

  async getState(userId: string) {
    // apply idle accrual inside a small atomic op to avoid races
    const state0 = await this.repo.getOrCreate(userId);
    const ticks = this.computeTicks(state0.lastActivityAt, new Date());
    if (ticks > 0 && state0.upgrades.autoMiner > 0) {
      const perTick = state0.upgrades.autoMiner * AUTO_RATE_PER_LEVEL;
      return this.repo.applyIdleAtomic(userId, ticks, perTick, new Date());
    }
    return state0;
  }

  async mine(userId: string) {
    const now = new Date();
    let s = await this.getState(userId); // also applies idle
    if (
      s.lastClickAt &&
      now.getTime() - s.lastClickAt.getTime() < CLICK_COOLDOWN_MS
    ) {
      const remainingMs =
        CLICK_COOLDOWN_MS - (now.getTime() - s.lastClickAt.getTime());
      throw new Error(`cooldown:${Math.ceil(remainingMs / 1000)}s`);
    }
    const gain = BASE_CLICK + s.upgrades.superClick * CLICK_BONUS_PER_LEVEL;
    s = await this.repo.mineAtomic(userId, gain, now);
    return s;
  }

  async purchase(userId: string, upgrade: UpgradeType) {
    const now = new Date();
    const s0 = await this.getState(userId); // applies idle first
    const level = s0.upgrades[upgrade];
    const cost = nextCost(upgrade, level);
    const res = await this.repo.purchaseAtomic(userId, upgrade, cost, now);
    if (res === 'NOT_ENOUGH') {
      throw new Error('not_enough_coins');
    }
    return res;
  }

  async collect(userId: string) {
    const now = new Date();
    const s0 = await this.repo.getOrCreate(userId);
    const ticks = this.computeTicks(s0.lastActivityAt, now);
    if (ticks <= 0 || s0.upgrades.autoMiner <= 0) {
      return { coins: s0.coins, collected: 0, state: s0 };
    }
    const perTick = s0.upgrades.autoMiner * AUTO_RATE_PER_LEVEL;
    const s1 = await this.repo.applyIdleAtomic(userId, ticks, perTick, now);
    return { coins: s1.coins, collected: ticks * perTick, state: s1 };
  }
}
