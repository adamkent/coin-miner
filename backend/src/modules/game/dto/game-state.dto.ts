import { ApiProperty } from '@nestjs/swagger';

export class GameStateDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'demo',
  })
  userId: string;

  @ApiProperty({
    description: 'Current coin balance',
    example: 42,
  })
  coins: number;

  @ApiProperty({
    description: 'Upgrade levels for each type',
    example: { autoMiner: 2, superClick: 1 },
  })
  upgrades: {
    autoMiner: number;
    superClick: number;
  };

  @ApiProperty({
    description: 'Timestamp of last activity',
    example: '2025-09-03T14:30:00.000Z',
  })
  lastActivityAt: Date;

  @ApiProperty({
    description: 'Timestamp of last click (null if never clicked)',
    example: '2025-09-03T14:29:55.000Z',
    nullable: true,
  })
  lastClickAt: Date | null;
}
