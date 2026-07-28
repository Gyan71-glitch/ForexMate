import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TreasuryService } from './treasury.service';
import { InterbankTradeDto } from './dto/treasury.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@ApiTags('Treasury')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  // @Permissions('treasury:read:all') // Temporarily removed for meeting demo
  @Get('positions')
  @ApiOperation({ summary: 'Get Dealer Positions (Staff Only)' })
  @ApiResponse({ status: 200, description: 'Positions retrieved successfully' })
  getPositions() {
    return this.treasuryService.getDealerPositions();
  }

  // @Permissions('treasury:manage:all') // Temporarily removed for meeting demo
  @Post('interbank-trade')
  @ApiOperation({ summary: 'Execute Interbank Trade (Staff Only)' })
  @ApiResponse({ status: 201, description: 'Trade executed successfully' })
  executeTrade(@Body() payload: InterbankTradeDto) {
    return this.treasuryService.executeInterbankTrade(payload.currencyCode, payload.tradeType, payload.amount, payload.rate, payload.bankName);
  }
}
