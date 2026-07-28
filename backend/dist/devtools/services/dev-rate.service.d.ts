import { PrismaService } from '../../prisma/prisma.service';
export declare class DevRateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    setRateMode(mode: string): Promise<{
        success: boolean;
        mode: string;
    }>;
    getRateMode(): Promise<{
        mode: any;
    }>;
}
