import { VaultTransferService } from './vault-transfer.service';
export declare class VaultTransferController {
    private readonly transferService;
    constructor(transferService: VaultTransferService);
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
        quantity: import("@prisma/client/runtime/library").Decimal;
        requestedById: string;
        approvedById: string | null;
    })[]>;
    createTransfer(dto: {
        sourceBranchId: string;
        destBranchId: string;
        currencyCode: string;
        quantity: number;
        reason: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        currencyCode: string;
        transferNumber: string;
        sourceBranchId: string;
        destBranchId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        requestedById: string;
        approvedById: string | null;
    }>;
}
