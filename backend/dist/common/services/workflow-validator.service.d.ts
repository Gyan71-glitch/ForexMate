import { PrismaService } from '../../prisma/prisma.service';
import { Order } from '@prisma/client';
export declare class WorkflowValidatorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validateTransition(orderId: string, action: string): Promise<Order>;
}
