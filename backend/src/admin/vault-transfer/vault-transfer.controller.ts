import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VaultTransferService } from './vault-transfer.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Permissions } from '../../auth/permissions.decorator';

@ApiTags('Admin / Vault Transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/vault-transfers')
export class VaultTransferController {
  constructor(private readonly transferService: VaultTransferService) {}

  @Get()
  @Permissions('users:manage:all')
  getAllTransfers() {
    return this.transferService.getAllTransfers();
  }

  @Post()
  @Permissions('users:manage:all')
  createTransfer(
    @Body()
    dto: {
      sourceBranchId: string;
      destBranchId: string;
      currencyCode: string;
      quantity: number;
      reason: string;
    },
    @Request() req: any,
  ) {
    return this.transferService.createTransfer(req.user.id, dto);
  }
}
