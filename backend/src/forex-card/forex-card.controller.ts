import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ForexCardService } from './forex-card.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Forex Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('forex-cards')
export class ForexCardController {
  constructor(private readonly forexCardService: ForexCardService) {}

  @Post('apply/:userId')
  @ApiOperation({ summary: 'Apply for a Forex Card' })
  @ApiResponse({ status: 201, description: 'Card application successful' })
  @ApiBody({ schema: { type: 'object', properties: { currencyId: { type: 'string' }, balance: { type: 'number' } } } })
  applyForCard(
    @Param('userId') userId: string,
    @Body() data: { currencyId: string; balance: number },
    @Request() req: any,
  ) {
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      throw new ForbiddenException('You can only apply for your own card.');
    }
    return this.forexCardService.applyForCard(userId, data.currencyId, data.balance);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get Forex Cards for a specific user' })
  getUserCards(@Param('userId') userId: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      throw new ForbiddenException('You can only view your own cards.');
    }
    return this.forexCardService.getUserCards(userId);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get Forex Cards for the logged-in user (with wallets & recent txns)' })
  getMyCards(@Request() req: any) {
    return this.forexCardService.getUserCards(req.user.id);
  }

  @Get('mine/transactions')
  @ApiOperation({ summary: 'Get all card transactions for the logged-in user' })
  getMyTransactions(@Request() req: any) {
    return this.forexCardService.getAllTransactions(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific card' })
  getCardById(@Param('id') id: string, @Request() req: any) {
    return this.forexCardService.getCardById(id, req.user.id);
  }

  @Patch(':id/freeze')
  @ApiOperation({ summary: 'Freeze a card' })
  freezeCard(@Param('id') id: string, @Request() req: any) {
    return this.forexCardService.freezeCard(id, req.user.id);
  }

  @Patch(':id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze a card' })
  unfreezeCard(@Param('id') id: string, @Request() req: any) {
    return this.forexCardService.unfreezeCard(id, req.user.id);
  }

  @Post(':id/reload')
  @ApiOperation({ summary: 'Reload a card wallet' })
  @ApiBody({ schema: { type: 'object', properties: { currencyId: { type: 'string' }, amount: { type: 'number' } } } })
  reloadCard(
    @Param('id') id: string,
    @Body() data: { currencyId: string; amount: number },
    @Request() req: any,
  ) {
    return this.forexCardService.reloadCard(id, req.user.id, data.currencyId, data.amount);
  }
}
