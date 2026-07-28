import { TreasuryService } from './treasury.service';
import { InterbankTradeDto } from './dto/treasury.dto';
export declare class TreasuryController {
    private readonly treasuryService;
    constructor(treasuryService: TreasuryService);
    getPositions(): Promise<({
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
    executeTrade(payload: InterbankTradeDto): Promise<{
        id: string;
        bankName: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        currencyId: string;
        tradeType: string;
        tradeDate: Date;
    }>;
}
