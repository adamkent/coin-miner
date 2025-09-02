export type UpgradeType = 'autoMiner' | 'superClick';

export interface GameState {
  userId: string;
  coins: number;
  upgrades: { autoMiner: number; superClick: number };
  lastActivityAt: Date;
  lastClickAt: Date | null;
}
