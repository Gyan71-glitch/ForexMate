import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class VaultTransferService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllTransfers(): Promise<({
        sourceBranch: {
            id: string;
            branchCode: string;
            branchName: string;
            branchCity: string;
        };
        destBranch: {
            id: string;
            branchCode: string;
            branchName: string;
            branchCity: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        currencyCode: string;
        transferNumber: string;
        sourceBranchId: string;
        destBranchId: string;
        quantity: Prisma.Decimal;
        requestedById: string;
        approvedById: string | null;
    })[]>;
    createTransfer(userId: string, dto: {
        sourceBranchId: string;
        destBranchId: string;
        currencyCode: string;
        quantity: number;
        reason: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        currencyCode: string;
        transferNumber: string;
        sourceBranchId: string;
        destBranchId: string;
        quantity: Prisma.Decimal;
        requestedById: string;
        approvedById: string | null;
    }>;
}
