import { GameService } from '../game.service';
import { InMemoryRepo } from './helpers/mock-repo';
import { AUTO_MINER_INTERVALS } from '../game.config';

function advance(date: Date, ms: number) {
  return new Date(date.getTime() + ms);
}

describe('GameService', () => {
  let svc: GameService;
  let repo: InMemoryRepo;

  beforeEach(() => {
    repo = new InMemoryRepo();
    svc = new GameService(repo);
  });

  it('creates new users and returns initial state', async () => {
    const s = await svc.createUser('u1');
    expect(s.userId).toBe('u1');
    expect(s.coins).toBe(0);
    expect(s.upgrades.autoMiner).toBe(0);
    expect(s.lastActivityAt).toBeDefined();
    expect(typeof s.lastActivityAt.getTime).toBe('function');
  });

  it('applies idle accrual on getState when autoMiner > 0', async () => {
    const s0 = await svc.createUser('u2');
    s0.upgrades.autoMiner = 2; // simulate upgrade
    await repo.save(s0);
    // simulate time passing = 3 intervals
    const autoMinerInterval = AUTO_MINER_INTERVALS[2];
    const s2Init = await repo.findById('u2');
    if (s2Init) {
      s2Init.lastActivityAt = advance(s2Init.lastActivityAt, -3 * autoMinerInterval);
      await repo.save(s2Init);
    }
    const s2 = await svc.getState('u2');
    expect(s2.coins).toBe(3); // 3 intervals
  });

  it('enforces cooldown on mine', async () => {
    await svc.createUser('u3');
    const s = await svc.mine('u3');
    expect(s.coins).toBe(1); // BASE_CLICK = 1
    await expect(svc.mine('u3')).rejects.toThrow(/cooldown/);
  });

  it('adds click bonus from superClick level', async () => {
    let s = await svc.createUser('u4');
    s.upgrades.superClick = 3;
    s.lastClickAt = null; // allow click
    // set last activity to far past to avoid cooldown
    s.lastActivityAt = new Date(Date.now() - 60000);
    await repo.save(s);
    s = await svc.mine('u4');
    // BASE_CLICK=1 + 3*1 = 4 gain
    expect(s.coins).toBe(4);
  });

  it('purchase fails when not enough coins', async () => {
    await svc.createUser('u5');
    await expect(svc.purchase('u5', 'autoMiner')).rejects.toThrow(
      'not_enough_coins',
    );
  });

  it('purchase deducts and increments level when enough coins', async () => {
    let s = await svc.createUser('u6');
    s.coins = 20; // fund
    await repo.save(s);
    s = await svc.purchase('u6', 'autoMiner');
    expect(s.upgrades.autoMiner).toBe(1);
    expect(s.coins).toBeLessThan(20);
  });

  it('collect returns amount gathered and advances activity timestamp', async () => {
    let s = await svc.createUser('u7');
    s.upgrades.autoMiner = 1;
    await repo.save(s);
    // Backdate lastActivityAt by 4 intervals
    s = (await repo.findById('u7'))!;
    const autoMinerInterval = AUTO_MINER_INTERVALS[1];
    s.lastActivityAt = new Date(Date.now() - 4 * autoMinerInterval);
    await repo.save(s);
    const result = await svc.collect('u7');
    expect(result.collected).toBe(4);
    expect(result.coins).toBe(4);
  });
});
