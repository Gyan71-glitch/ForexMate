import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { CreateLedgerDto, CreateJournalEntryDto } from './dto/accounting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@ApiTags('Accounting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Permissions('accounting:manage:all')
  @Post('ledgers')
  @ApiOperation({ summary: 'Create a new General Ledger account (Staff Only)' })
  @ApiResponse({ status: 201, description: 'Ledger created' })
  createLedger(@Body() dto: CreateLedgerDto) {
    return this.accountingService.createLedger(dto);
  }

  @Permissions('accounting:read:all')
  @Get('ledgers')
  @ApiOperation({ summary: 'List all General Ledgers (Staff Only)' })
  @ApiResponse({ status: 200, description: 'Ledgers retrieved' })
  getLedgers() {
    return this.accountingService.getLedgers();
  }

  @Permissions('accounting:manage:all')
  @Post('journals')
  @ApiOperation({ summary: 'Create a Journal Entry (Staff Only)' })
  @ApiResponse({ status: 201, description: 'Journal Entry created' })
  createJournalEntry(@Body() dto: CreateJournalEntryDto) {
    return this.accountingService.createJournalEntry(dto);
  }

  @Permissions('accounting:read:all')
  @Get('journals')
  @ApiOperation({ summary: 'List all Journal Entries (Staff Only)' })
  @ApiResponse({ status: 200, description: 'Journal Entries retrieved' })
  getJournals() {
    return this.accountingService.getJournals();
  }
}
