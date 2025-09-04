import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { GameService } from './game.service';
import { PurchaseDto } from './dto/purchase.dto';
import { GameStateDto } from './dto/game-state.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@ApiTags('Game')
@Controller()
export class GameController {
  constructor(private readonly svc: GameService) {}

  private generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `Player-${timestamp}${random}`.toUpperCase();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new player and get unique user ID' })
  @ApiResponse({
    status: 201,
    description: 'New player registered',
    type: RegisterResponseDto,
  })
  async register(): Promise<RegisterResponseDto> {
    const userId = this.generateUserId();
    // Actually create the user in the database
    await this.svc.createUser(userId);
    return { userId };
  }

  @Get('state')
  @ApiOperation({ summary: 'Get current game state for user' })
  @ApiQuery({
    name: 'userId',
    description: 'Player user ID',
    example: 'Player-ABC123',
  })
  @ApiResponse({
    status: 200,
    description: 'Current game state',
    type: GameStateDto,
  })
  async getState(@Query('userId') userId: string): Promise<GameStateDto> {
    if (!userId) {
      throw new HttpException(
        'userId query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.svc.getState(userId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('mine')
  @ApiOperation({ summary: 'Mine coins (with 5s cooldown)' })
  @ApiQuery({
    name: 'userId',
    description: 'Player user ID',
    example: 'Player-ABC123',
  })
  @ApiResponse({ status: 201, description: 'Updated game state after mining' })
  @ApiResponse({ status: 400, description: 'Cooldown active' })
  async mine(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException(
        'userId query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.svc.mine(userId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase an upgrade' })
  @ApiQuery({
    name: 'userId',
    description: 'Player user ID',
    example: 'Player-ABC123',
  })
  @ApiBody({
    type: PurchaseDto,
    examples: {
      autoMiner: { value: { upgrade: 'autoMiner' } },
      superClick: { value: { upgrade: 'superClick' } },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Updated game state after purchase',
  })
  @ApiResponse({ status: 400, description: 'Not enough coins' })
  async purchase(@Query('userId') userId: string, @Body() body: PurchaseDto) {
    if (!userId) {
      throw new HttpException(
        'userId query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.svc.purchase(userId, body.upgrade);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.includes('not_enough_coins')) {
        throw new HttpException('Not enough coins!', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('collect')
  @ApiOperation({ summary: 'Collect idle coins from auto-miners' })
  @ApiQuery({
    name: 'userId',
    description: 'Player user ID',
    example: 'Player-ABC123',
  })
  @ApiResponse({
    status: 201,
    description: 'Collected coins and updated state',
  })
  async collect(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException(
        'userId query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.svc.collect(userId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
