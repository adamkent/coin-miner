import { GameState } from './game.types';

export interface GameRepository {
  getOrCreate(userId: string): Promise<GameState>;
  save(state: GameState): Promise<void>;
  // Domain ops that need atomicity (implemented with Prisma transactions)
  mineAtomic(userId: string, gain: number, now: Date): Promise<GameState>;
  purchaseAtomic(
    userId: string,
    upgrade: 'autoMiner' | 'superClick',
    cost: number,
    now: Date,
  ): Promise<GameState | 'NOT_ENOUGH'>;
  applyIdleAtomic(
    userId: string,
    ticks: number,
    perTick: number,
    now: Date,
  ): Promise<GameState>;
}
