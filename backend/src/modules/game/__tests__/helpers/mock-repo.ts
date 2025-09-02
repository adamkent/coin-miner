import { GameRepository } from '../../game.repository';
import { GameState } from '../../game.types';

export class InMemoryRepo implements GameRepository {
  store = new Map<string, GameState>();
  
  async findById(userId: string) {
    return this.store.get(userId) ?? null;
  }
  
  async getOrCreate(userId: string): Promise<GameState> {
    const existing = this.store.get(userId);
    if (existing) return structuredClone(existing);
    
    const now = new Date();
    const state: GameState = {
      userId,
      coins: 0,
      upgrades: { autoMiner: 0, superClick: 0 },
      lastActivityAt: now,
      lastClickAt: null,
    };
    this.store.set(userId, structuredClone(state));
    return structuredClone(state);
  }
  
  async save(state: GameState) {
    this.store.set(state.userId, structuredClone(state));
  }
  
  async mineAtomic(userId: string, gain: number, now: Date): Promise<GameState> {
    const state = await this.getOrCreate(userId);
    state.coins += gain;
    state.lastClickAt = now;
    state.lastActivityAt = now;
    this.store.set(userId, structuredClone(state));
    return structuredClone(state);
  }
  
  async purchaseAtomic(
    userId: string,
    upgrade: 'autoMiner' | 'superClick',
    cost: number,
    now: Date,
  ): Promise<GameState | 'NOT_ENOUGH'> {
    const state = await this.getOrCreate(userId);
    if (state.coins < cost) return 'NOT_ENOUGH';
    
    state.coins -= cost;
    state.upgrades[upgrade]++;
    state.lastActivityAt = now;
    this.store.set(userId, structuredClone(state));
    return structuredClone(state);
  }
  
  async applyIdleAtomic(
    userId: string,
    ticks: number,
    perTick: number,
    now: Date,
  ): Promise<GameState> {
    const state = await this.getOrCreate(userId);
    state.coins += ticks * perTick;
    state.lastActivityAt = now;
    this.store.set(userId, structuredClone(state));
    return structuredClone(state);
  }
}
