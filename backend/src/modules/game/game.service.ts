import { Injectable } from '@nestjs/common';
@Injectable()
export class GameService {
  private mock = { userId: 'demo', coins: 0, upgrades:{autoMiner:0, superClick:0} };
  getState() { return this.mock; }
  mine() { this.mock.coins += 1; return this.mock; }
  purchase(upgrade: 'autoMiner'|'superClick') { this.mock.upgrades[upgrade]++; return this.mock; }
  collect() { return this.mock; }
}
