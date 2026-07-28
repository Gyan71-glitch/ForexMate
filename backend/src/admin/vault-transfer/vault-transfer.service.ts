import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VaultTransferService {
  constructor(private prisma: PrismaService) {}

  async getAllTransfers() {
    return this.prisma.vaultTransfer.findMany({
      include: {
        sourceBranch: { select: { id: true, branchName: true, branchCode: true, branchCity: true } },
        destBranch: { select: { id: true, branchName: true, branchCode: true, branchCity: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createTransfer(
    userId: string,
    dto: {
      sourceBranchId: string;
      destBranchId: string;
      currencyCode: string;
      quantity: number;
      reason: string;
    },
  ) {
    if (dto.sourceBranchId === dto.destBranchId) {
      throw new BadRequestException('Source and Destination branch cannot be the same.');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0.');
    }

    const [sourceBranch, destBranch] = await Promise.all([
      this.prisma.branch.findUnique({ where: { id: dto.sourceBranchId } }),
      this.prisma.branch.findUnique({ where: { id: dto.destBranchId } }),
    ]);

    if (!sourceBranch || !destBranch) {
      throw new NotFoundException('Source or destination branch not found.');
    }

    const transferNumber = `VT-${Date.now()}`;

    return this.prisma.$transaction(async (tx) => {
      // Create transfer record
      const transfer = await tx.vaultTransfer.create({
        data: {
          transferNumber,
          sourceBranchId: dto.sourceBranchId,
          destBranchId: dto.destBranchId,
          currencyCode: dto.currencyCode,
          quantity: new Prisma.Decimal(dto.quantity),
          reason: dto.reason,
          requestedById: userId,
          approvedById: userId,
          status: 'APPROVED',
        },
      });

      // Update source inventory
      const sourceInv = await tx.branchInventory.findFirst({
        where: { branchId: dto.sourceBranchId, currencyCode: dto.currencyCode },
      });

      if (sourceInv) {
        await tx.branchInventory.update({
          where: { id: sourceInv.id },
          data: { availableAmount: { decrement: dto.quantity } },
        });
      }

      // Update destination inventory
      const destInv = await tx.branchInventory.findFirst({
        where: { branchId: dto.destBranchId, currencyCode: dto.currencyCode },
      });

      if (destInv) {
        await tx.branchInventory.update({
          where: { id: destInv.id },
          data: { availableAmount: { increment: dto.quantity } },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'VAULT_TRANSFER_EXECUTED',
          entityName: 'VaultTransfer',
          entityId: transfer.id,
          branchId: dto.sourceBranchId,
          newData: {
            transferNumber,
            sourceBranch: sourceBranch.branchName,
            destBranch: destBranch.branchName,
            currencyCode: dto.currencyCode,
            quantity: dto.quantity,
            reason: dto.reason,
          },
        },
      });

      return transfer;
    });
  }
}
