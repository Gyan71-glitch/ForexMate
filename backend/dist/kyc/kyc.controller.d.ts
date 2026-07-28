import { PrismaService } from '../prisma/prisma.service';
export declare class KycController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRequirements(orderId: string): Promise<{
        requiredDocuments: any[];
    }>;
}
