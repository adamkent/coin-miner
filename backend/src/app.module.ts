import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [GameModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
