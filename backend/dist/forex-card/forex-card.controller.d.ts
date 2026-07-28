import { ForexCardService } from './forex-card.service';
export declare class ForexCardController {
    private readonly forexCardService;
    constructor(forexCardService: ForexCardService);
    applyForCard(userId: string, data: {
        currencyId: string;
        balance: number;
    }, req: any): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    }>;
    getUserCards(userId: string, req: any): Promise<({
        provider: {
            id: string;
            name: string;
            isActive: boolean;
        } | null;
        transactions: ({
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
            createdAt: Date;
            status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currencyId: string;
            cardId: string;
            merchant: string;
        })[];
        wallets: ({
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
            balance: import("@prisma/client/runtime/library").Decimal;
            cardId: string;
        })[];
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    })[]>;
    getMyCards(req: any): Promise<({
        provider: {
            id: string;
            name: string;
            isActive: boolean;
        } | null;
        transactions: ({
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
            createdAt: Date;
            status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currencyId: string;
            cardId: string;
            merchant: string;
        })[];
        wallets: ({
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
            balance: import("@prisma/client/runtime/library").Decimal;
            cardId: string;
        })[];
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    })[]>;
    getMyTransactions(req: any): Promise<({
        currency: {
            symbol: string;
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            decimals: number;
        };
        card: {
            cardNumber: string;
            cardVendor: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currencyId: string;
        cardId: string;
        merchant: string;
    })[]>;
    getCardById(id: string, req: any): Promise<{
        provider: {
            id: string;
            name: string;
            isActive: boolean;
        } | null;
        transactions: ({
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
            createdAt: Date;
            status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currencyId: string;
            cardId: string;
            merchant: string;
        })[];
        wallets: ({
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
            balance: import("@prisma/client/runtime/library").Decimal;
            cardId: string;
        })[];
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    }>;
    freezeCard(id: string, req: any): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    }>;
    unfreezeCard(id: string, req: any): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    }>;
    reloadCard(id: string, data: {
        currencyId: string;
        amount: number;
    }, req: any): Promise<{
        id: string;
        updatedAt: Date;
        currencyId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        cardId: string;
    }>;
}
