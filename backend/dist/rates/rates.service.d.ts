import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FastForexAdapter } from './providers/fastforex.adapter';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';
export declare class RatesService implements OnModuleInit {
    private prisma;
    private readonly fastForexAdapter;
    private readonly eventBus;
    private readonly logger;
    constructor(prisma: PrismaService, fastForexAdapter: FastForexAdapter, eventBus: DomainEventBus);
    onModuleInit(): Promise<void>;
    handleCron(): Promise<void>;
    fetchAndSaveRates(): Promise<void>;
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
    updateRate(id: string, inrRate: number, marginBuyPct: number, marginSellPct: number): Promise<{
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
    updateProduct(id: string, isActive: boolean): Promise<{
        id: string;
        name: string;
        code: string;
        isActive: boolean;
    }>;
}
