import { Body, Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GameService } from './game.service';
import { PurchaseDto } from './dto/purchase.dto';
import { GameStateDto } from './dto/game-state.dto';
import { CollectResultDto } from './dto/collect-result.dto';

@ApiTags('Game')
@Controller()
export class GameController {
  constructor(private readonly svc: GameService) {}

  @Get('state')
  @ApiOperation({ summary: 'Get current game state for demo user' })
  @ApiResponse({ status: 200, description: 'Current game state', type: GameStateDto })
  async getState(): Promise<GameStateDto> {
    try {
      return await this.svc.getState('demo');
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('mine')
  @ApiOperation({ summary: 'Mine coins (with 5s cooldown)' })
  @ApiResponse({ status: 201, description: 'Updated game state after mining' })
  @ApiResponse({ status: 400, description: 'Cooldown active' })
  async mine() {
    try {
      return await this.svc.mine('demo');
    } catch (error) {
      if (error.message.includes('cooldown')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase an upgrade' })
  @ApiBody({ 
    type: PurchaseDto,
    examples: {
      autoMiner: { value: { upgrade: 'autoMiner' } },
      superClick: { value: { upgrade: 'superClick' } }
    }
  })
  @ApiResponse({ status: 201, description: 'Updated game state after purchase' })
  @ApiResponse({ status: 400, description: 'Not enough coins' })
  async purchase(@Body() body: PurchaseDto) {
    try {
      return await this.svc.purchase('demo', body.upgrade);
    } catch (error) {
      if (error.message.includes('not_enough_coins')) {
        throw new HttpException('Not enough coins!', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('collect')
  @ApiOperation({ summary: 'Collect idle coins from auto-miners' })
  @ApiResponse({ status: 201, description: 'Collected coins and updated state' })
  async collect() {
    try {
      return await this.svc.collect('demo');
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
