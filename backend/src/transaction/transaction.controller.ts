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
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Transactions (Legacy)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Create a new transaction (authenticated users with orders:read:own) ───
  @UseGuards(PermissionsGuard)
  @Permissions('orders:read:own')
  @Post()
  @ApiOperation({ summary: 'Create a new transaction (Legacy)' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  createTransaction(@Body() data: any, @Request() req: any) {
    return this.transactionService.createTransaction({
      ...data,
      userId: req.user.id,
    });
  }

  // ─── Get transactions for a specific user (own or staff) ─────────────────
  @Get('user/:id')
  @ApiOperation({ summary: 'Get transactions for a user' })
  @ApiResponse({ status: 200, description: 'User transactions retrieved' })
  async getUserTransactions(@Param('id') id: string, @Request() req: any) {
    const requestedId = id; // User UUID is a string

    // Resolve user's dynamic permissions
    const userRole = await this.prisma.role.findUnique({
      where: { id: req.user.roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const userPermissions = userRole?.permissions.map(
      (rp) => rp.permission.action,
    ) || [];

    const canReadAll = userPermissions.includes('orders:read:all');
    const canReadOwn = userPermissions.includes('orders:read:own') && req.user.id === requestedId;

    if (!canReadAll && !canReadOwn) {
      throw new ForbiddenException(
        'You do not have permission to view these transactions.',
      );
    }

    return this.transactionService.getUserTransactions(requestedId);
  }

  // ─── Get all transactions (staff only) ───────────────────────────────────
  @UseGuards(PermissionsGuard)
  @Permissions('orders:read:all')
  @Get()
  @ApiOperation({ summary: 'Get all transactions (Staff Only)' })
  @ApiResponse({ status: 200, description: 'All transactions retrieved' })
  getAllTransactions() {
    return this.transactionService.getAllTransactions();
  }

  // ─── Update transaction status (staff only) ───────────────────────────────
  @UseGuards(PermissionsGuard)
  @Permissions('orders:update:status')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transaction status (Staff Only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
    @Request() req: any,
  ) {
    return this.transactionService.updateStatus(id, body.status, req.user.id);
  }
}
