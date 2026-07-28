import { PublicService } from './public.service';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    getRates(): Promise<({
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
    getCurrencies(): Promise<{
        symbol: string;
        id: string;
        name: string;
        code: string;
    }[]>;
    getBranches(): Promise<{
        id: string;
        branchCode: string;
        branchName: string;
        branchAddress: string;
        branchCity: string;
        workingHours: string | null;
    }[]>;
    getTestimonials(): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        customerName: string;
        rating: number;
        reviewText: string;
        location: string | null;
        avatarUrl: string | null;
    }[]>;
    getRemittancePurposes(): Promise<({
        documentRequirements: {
            id: string;
            required: boolean;
            docType: string;
            purposeId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string;
        code: string;
        isActive: boolean;
        tcsRate: import("@prisma/client/runtime/library").Decimal;
        tcsThreshold: import("@prisma/client/runtime/library").Decimal;
        tcsRateAbove: import("@prisma/client/runtime/library").Decimal;
        tcsRateBelow: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getRemittanceCountries(): Promise<({
        feeConfigurations: {
            id: string;
            countryId: string;
            minAmountInr: import("@prisma/client/runtime/library").Decimal;
            maxAmountInr: import("@prisma/client/runtime/library").Decimal;
            feeAmountInr: import("@prisma/client/runtime/library").Decimal;
            feePercentage: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        isActive: boolean;
        currencyCode: string;
        countryCode: string;
        countryName: string;
    })[]>;
}
