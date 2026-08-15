import { PrismaService } from '../prisma/prisma.service';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';
import { Prisma } from '@prisma/client';
export declare class CashAllocationService {
    private readonly prisma;
    private readonly eventBus;
    constructor(prisma: PrismaService, eventBus: DomainEventBus);
    createAllocation(userId: string, userRole: string, orderId: string, items: {
        denomination: number;
        quantity: number;
    }[]): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: Prisma.Decimal;
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
        allocatedAmount: Prisma.Decimal;
        allocatedBy: string;
        allocatedAt: Date;
    }>;
    getAllocation(orderId: string): Promise<({
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: Prisma.Decimal;
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
        allocatedAmount: Prisma.Decimal;
        allocatedBy: string;
        allocatedAt: Date;
    }) | null>;
}
