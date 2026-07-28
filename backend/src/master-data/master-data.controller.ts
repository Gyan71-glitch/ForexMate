import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service';
import { CreateBranchDto, CreateCurrencyDto } from './dto/master-data.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@ApiTags('Master Data')
@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  /**
   * Returns all active master data for the frontend to cache.
   * This endpoint is public for now, as it only contains generic configuration.
   */
  @Get()
  @ApiOperation({ summary: 'Get all active master data (Currencies, Countries, Branches, etc.)' })
  @ApiResponse({ status: 200, description: 'Master data retrieved successfully' })
  async getMasterData() {
    return this.masterDataService.getAggregatedMasterData();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('masterdata:manage:all')
  @Post('branches')
  @ApiOperation({ summary: 'Add a new Branch (Staff Only)' })
  @ApiResponse({ status: 201, description: 'Branch added' })
  addBranch(@Body() dto: CreateBranchDto) {
    return this.masterDataService.addBranch(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('masterdata:manage:all')
  @Post('currencies')
  @ApiOperation({ summary: 'Add a new Currency (Staff Only)' })
  @ApiResponse({ status: 201, description: 'Currency added' })
  addCurrency(@Body() dto: CreateCurrencyDto) {
    return this.masterDataService.addCurrency(dto);
  }
}
