import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { UpgradeType } from './game.types';

@Controller()
export class GameController {
  constructor(private readonly svc: GameService) {}

  // In real app you'd get userId from auth/session; here accept body/query for simplicity
  @Get('state')
  getState() {
    return this.svc.getState('demo');
  }

  @Post('mine')
  mine() {
    return this.svc.mine('demo');
  }

  @Post('purchase')
  purchase(@Body() body: { upgrade: UpgradeType }) {
    return this.svc.purchase('demo', body.upgrade);
  }

  @Post('collect')
  collect() {
    return this.svc.collect('demo');
  }
}
