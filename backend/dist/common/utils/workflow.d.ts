import { Prisma } from '@prisma/client';
export declare function mapOrderStatus(order: any): string;
export declare function activateBranchWorkflow(orderId: string, tx: Prisma.TransactionClient): Promise<void>;
