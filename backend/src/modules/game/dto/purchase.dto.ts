import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { UpgradeType } from '../game.types';

export class PurchaseDto {
  @ApiProperty({
    description: 'Type of upgrade to purchase',
    enum: ['autoMiner', 'superClick'],
    example: 'autoMiner',
  })
  @IsIn(['autoMiner', 'superClick'])
  upgrade: UpgradeType;
}
