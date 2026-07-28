import { PrismaService } from '../prisma/prisma.service';
export declare class TreasuryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    executeInterbankTrade(currencyCode: string, tradeType: 'BUY' | 'SELL', amount: number, rate: number, bankName: string): Promise<{
        id: string;
        bankName: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        currencyId: string;
        tradeType: string;
        tradeDate: Date;
    }>;
    getDealerPositions(): Promise<({
        currency: {
            symbol: string;
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            decimals: number;
        };
    } & {
        id: string;
        currencyId: string;
        netOpenPosition: import("@prisma/client/runtime/library").Decimal;
        totalBought: import("@prisma/client/runtime/library").Decimal;
        totalSold: import("@prisma/client/runtime/library").Decimal;
        averageBuyRate: import("@prisma/client/runtime/library").Decimal;
        averageSellRate: import("@prisma/client/runtime/library").Decimal;
        lastUpdated: Date;
    })[]>;
}
