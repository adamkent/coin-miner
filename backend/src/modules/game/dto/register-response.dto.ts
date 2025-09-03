import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Unique user identifier for the game session',
    example: 'Player-ABC123',
  })
  userId: string;
}
