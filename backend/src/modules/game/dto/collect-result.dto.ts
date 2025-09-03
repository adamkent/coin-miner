import { ApiProperty } from '@nestjs/swagger';

export class CollectResultDto {
  @ApiProperty({
    description: 'Total coins after collection',
    example: 47,
  })
  coins: number;

  @ApiProperty({
    description: 'Amount of coins collected from idle mining',
    example: 5,
  })
  collected: number;

  @ApiProperty({
    description: 'Updated game state after collection',
  })
  state: {
    userId: string;
    coins: number;
    upgrades: { autoMiner: number; superClick: number };
    lastActivityAt: Date;
    lastClickAt: Date | null;
  };
}
