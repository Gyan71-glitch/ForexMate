import { PrismaService } from '../prisma/prisma.service';
export declare class ForexCardService {
    private prisma;
    constructor(prisma: PrismaService);
    applyForCard(userId: string, currencyId: string, balance: number): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    }>;
    getUserCards(userId: string): Promise<({
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
    getCardById(cardId: string, userId: string): Promise<{
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
    getAllTransactions(userId: string): Promise<({
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
    freezeCard(cardId: string, userId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    }>;
    unfreezeCard(cardId: string, userId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        cardNumber: string;
        cardVendor: string;
        cardStatus: import(".prisma/client").$Enums.CardStatus;
        providerId: string | null;
    }>;
    reloadCard(cardId: string, userId: string, currencyId: string, amount: number): Promise<{
        id: string;
        updatedAt: Date;
        currencyId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        cardId: string;
    }>;
}
