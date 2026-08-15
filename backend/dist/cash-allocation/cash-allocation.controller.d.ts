import { CashAllocationService } from './cash-allocation.service';
export declare class CashAllocationController {
    private readonly cashAllocationService;
    constructor(cashAllocationService: CashAllocationService);
    create(body: {
        orderId: string;
        items: {
            denomination: number;
            quantity: number;
        }[];
    }, req: any): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            cashAllocationId: string;
            denomination: number;
            quantity: number;
        }[];
    } & {
        id: string;
        orderId: string;
        createdAt: Date;
        branchId: string;
        status: string;
        updatedAt: Date;
        currencyCode: string;
        allocatedAmount: import("@prisma/client/runtime/library").Decimal;
        allocatedBy: string;
        allocatedAt: Date;
    }>;
    findOne(orderId: string): Promise<({
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            cashAllocationId: string;
            denomination: number;
            quantity: number;
        }[];
    } & {
        id: string;
        orderId: string;
        createdAt: Date;
        branchId: string;
        status: string;
        updatedAt: Date;
        currencyCode: string;
        allocatedAmount: import("@prisma/client/runtime/library").Decimal;
        allocatedBy: string;
        allocatedAt: Date;
    }) | null>;
}
