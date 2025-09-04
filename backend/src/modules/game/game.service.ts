import { Injectable } from '@nestjs/common';
import type { GameRepository } from './game.repository';
import { UpgradeType } from './game.types';
import {
  CLICK_COOLDOWN_MS,
  AUTO_MINER_INTERVALS,
  SUPER_CLICK_COINS,
  MAX_UPGRADE_LEVEL,
  getUpgradeCost,
} from './game.config';

@Injectable()
export class GameService {
  constructor(private readonly repo: GameRepository) {}

  /**
   * Create a new user with initial game state.
   * @param userId - User identifier
   * @returns Created game state
   */
  async createUser(userId: string) {
    return this.repo.createUser(userId);
  }

  /**
   * Get current game state, applying idle coins if auto-miner is active.
   * @param userId - User identifier
   * @returns Current game state with idle coins applied
   */
  async getState(userId: string) {
    const state = await this.repo.getState(userId);
    if (!state) {
      throw new Error('User not found');
    }

    // Apply idle coins if auto-miner is active
    if (state.upgrades.autoMiner > 0) {
      const now = new Date();
      const timeSinceLastActivity =
        now.getTime() - state.lastActivityAt.getTime();
      const autoMinerInterval = AUTO_MINER_INTERVALS[state.upgrades.autoMiner];

      if (timeSinceLastActivity >= autoMinerInterval) {
        const coinsToAdd = Math.floor(
          timeSinceLastActivity / autoMinerInterval,
        );
        if (coinsToAdd > 0) {
          return this.repo.applyIdleAtomic(userId, coinsToAdd, 1, now);
        }
      }
    }

    return state;
  }

  /**
   * Mine coins with cooldown enforcement.
   * @param userId - User identifier
   * @returns Updated game state after mining
   * @throws Error if cooldown is active
   */
  async mine(userId: string) {
    const now = new Date();
    const state = await this.repo.getState(userId);
    if (!state) {
      throw new Error('User not found');
    }

    // Check cooldown
    if (
      state.lastClickAt &&
      now.getTime() - state.lastClickAt.getTime() < CLICK_COOLDOWN_MS
    ) {
      const remainingMs =
        CLICK_COOLDOWN_MS - (now.getTime() - state.lastClickAt.getTime());
      throw new Error(`cooldown:${Math.ceil(remainingMs / 1000)}s`);
    }

    // Calculate coins based on super-click level
    const coinsPerClick = SUPER_CLICK_COINS[state.upgrades.superClick];
    return this.repo.mineAtomic(userId, coinsPerClick, now);
  }

  /**
   * Purchase an upgrade (max level 4).
   * @param userId - User identifier
   * @param upgrade - Upgrade type to purchase
   * @returns Updated game state after purchase
   * @throws Error if insufficient coins or max level reached
   */
  async purchase(userId: string, upgrade: UpgradeType) {
    const now = new Date();
    const state = await this.repo.getState(userId);
    if (!state) {
      throw new Error('User not found');
    }
    const currentLevel = state.upgrades[upgrade];

    // Check if already at max level
    if (currentLevel >= MAX_UPGRADE_LEVEL) {
      throw new Error('max_level_reached');
    }

    const cost = getUpgradeCost(upgrade, currentLevel);
    if (!cost) {
      throw new Error('max_level_reached');
    }

    const result = await this.repo.purchaseAtomic(userId, upgrade, cost, now);
    if (result === 'NOT_ENOUGH') {
      throw new Error('not_enough_coins');
    }
    return result;
  }

  /**
   * Collect idle coins from auto-miner.
   * @param userId - User identifier
   * @returns Collection result with coins collected and updated state
   */
  async collect(userId: string) {
    const now = new Date();
    const state = await this.repo.getState(userId);
    if (!state) {
      throw new Error('User not found');
    }

    if (state.upgrades.autoMiner === 0) {
      return { coins: state.coins, collected: 0, state };
    }

    const timeSinceLastActivity =
      now.getTime() - state.lastActivityAt.getTime();
    const autoMinerInterval = AUTO_MINER_INTERVALS[state.upgrades.autoMiner];

    if (timeSinceLastActivity < autoMinerInterval) {
      return { coins: state.coins, collected: 0, state };
    }

    const coinsToAdd = Math.floor(timeSinceLastActivity / autoMinerInterval);
    const updatedState = await this.repo.applyIdleAtomic(
      userId,
      coinsToAdd,
      1,
      now,
    );

    return {
      coins: updatedState.coins,
      collected: coinsToAdd,
      state: updatedState,
    };
  }
}
