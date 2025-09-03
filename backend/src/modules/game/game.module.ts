import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaClient } from '../../../generated/prisma';
import { PrismaRepository } from './prisma.repository';

@Module({
  controllers: [GameController],
  providers: [
    PrismaClient,
    { provide: 'GameRepository', useClass: PrismaRepository },
    {
      provide: GameService,
      useFactory: (repo: any) => new GameService(repo),
      inject: ['GameRepository'],
    },
  ],
})
export class GameModule {}
