import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameModule } from './modules/game/game.module';
import { RootController } from './root.controller';

@Module({
  imports: [GameModule],
  controllers: [RootController],
  providers: [PrismaService],
})
export class AppModule {}
