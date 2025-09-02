import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';

@Controller()
export class GameController {
  constructor(private readonly svc: GameService) {}

  @Get('state') getState() { return this.svc.getState(); }

  @Post('mine') mine() { return this.svc.mine(); }

  @Post('purchase') purchase(@Body() body: { upgrade: 'autoMiner'|'superClick' }) {
    return this.svc.purchase(body.upgrade);
  }

  @Post('collect') collect() { return this.svc.collect(); }
}
