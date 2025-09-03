import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';
import { GameRepository } from './game.repository';
import { GameState } from './game.types';

function mapState(user: any, state: any, upgrades: any[]): GameState {
  const u = { autoMiner: 0, superClick: 0 };
  for (const up of upgrades)
    u[up.type as 'autoMiner' | 'superClick'] = up.level;
  return {
    userId: user.id,
    coins: state.coins,
    upgrades: u,
    lastActivityAt: state.lastActivityAt,
    lastClickAt: state.lastClickAt,
  };
}

@Injectable()
export class PrismaRepository implements GameRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(userId: string): Promise<GameState> {
    const user = await this.prisma.user.create({
      data: {
        id: userId,
        state: { create: { coins: 0 } },
      },
      include: { state: true, upgrades: true },
    });
    return mapState(user, user.state, user.upgrades);
  }

  async getState(userId: string): Promise<GameState | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { state: true, upgrades: true },
    });
    if (!user || !user.state) return null;
    return mapState(user, user.state, user.upgrades);
  }

  async getOrCreate(userId: string): Promise<GameState> {
    const user = await this.prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        state: { create: { coins: 0 } }, // defaults handle timestamps
      },
      update: {},
      include: { state: true, upgrades: true },
    });
    return mapState(user, user.state, user.upgrades);
  }

  async save(_state: GameState): Promise<void> {
    // not used directly in this pattern; domain ops are atomic methods below
    return;
  }

  async applyIdleAtomic(
    userId: string,
    ticks: number,
    perTick: number,
    now: Date,
  ): Promise<GameState> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { state: true, upgrades: true },
      });
      if (!user || !user.state) throw new Error('not_found');

      const inc = ticks * perTick;

      const state = await tx.playerState.update({
        where: { userId: userId },
        data: { coins: { increment: inc }, lastActivityAt: now },
      });

      return mapState(user, state, user.upgrades);
    });
  }

  async mineAtomic(
    userId: string,
    gain: number,
    now: Date,
  ): Promise<GameState> {
    return this.prisma.$transaction(async (tx) => {
      // Read current
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { state: true, upgrades: true },
      });
      if (!user || !user.state) throw new Error('not_found');

      // Cooldown is enforced in service; we just apply the write
      const state = await tx.playerState.update({
        where: { userId },
        data: {
          coins: { increment: gain },
          lastClickAt: now,
          lastActivityAt: now,
        },
      });

      return mapState(user, state, user.upgrades);
    });
  }

  async purchaseAtomic(
    userId: string,
    upgrade: 'autoMiner' | 'superClick',
    cost: number,
    now: Date,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Try atomic deduct with guard using updateMany
      const deducted = await tx.playerState.updateMany({
        where: { userId, coins: { gte: cost } },
        data: { coins: { decrement: cost }, lastActivityAt: now },
      });
      if (deducted.count === 0) return 'NOT_ENOUGH' as const;

      // Upsert upgrade level
      const up = await tx.upgrade.upsert({
        where: { userId_type: { userId, type: upgrade } },
        create: { userId, type: upgrade, level: 1 },
        update: { level: { increment: 1 } },
      });

      // Return new state
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { state: true, upgrades: true },
      });
      if (!user || !user.state) throw new Error('not_found');
      return mapState(user, user.state, user.upgrades);
    });
  }
}
