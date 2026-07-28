import { RatesService } from './rates.service';
export declare class RatesController {
    private readonly ratesService;
    constructor(ratesService: RatesService);
    getAllRates(): Promise<({
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
        updatedAt: Date;
        currencyId: string;
        inrRate: number;
        marginBuyPct: number;
        marginSellPct: number;
    })[]>;
    updateRate(id: string, body: {
        inrRate: number;
        marginBuyPct: number;
        marginSellPct: number;
    }): Promise<{
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
        updatedAt: Date;
        currencyId: string;
        inrRate: number;
        marginBuyPct: number;
        marginSellPct: number;
    }>;
    getProducts(): Promise<{
        id: string;
        name: string;
        code: string;
        isActive: boolean;
    }[]>;
    updateProduct(id: string, body: {
        isActive: boolean;
    }): Promise<{
        id: string;
        name: string;
        code: string;
        isActive: boolean;
    }>;
}
