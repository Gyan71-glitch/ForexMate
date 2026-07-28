"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatesService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const fastforex_adapter_1 = require("./providers/fastforex.adapter");
const domain_event_bus_service_1 = require("../common/event-bus/domain-event-bus.service");
let RatesService = RatesService_1 = class RatesService {
    prisma;
    fastForexAdapter;
    eventBus;
    logger = new common_1.Logger(RatesService_1.name);
    constructor(prisma, fastForexAdapter, eventBus) {
        this.prisma = prisma;
        this.fastForexAdapter = fastForexAdapter;
        this.eventBus = eventBus;
    }
    async onModuleInit() {
        this.fetchAndSaveRates();
    }
    async handleCron() {
        this.logger.log('Cron triggered: Fetching live exchange rates from FastForex...');
        await this.fetchAndSaveRates();
    }
    async fetchAndSaveRates() {
        try {
            const liveRates = await this.fastForexAdapter.fetchLiveRates();
            const dbCurrenciesList = await this.prisma.executeWithReconnect(() => this.prisma.currency.findMany({}));
            const currencyMap = {};
            for (const c of dbCurrenciesList) {
                currencyMap[c.code] = c.id;
            }
            const retailMarginRule = await this.prisma.executeWithReconnect(() => this.prisma.exchangeRateMarginRule.findFirst({
                where: { segment: 'RETAIL' }
            }));
            const margin = retailMarginRule?.marginPct || 0.01;
            const upserts = [];
            for (const [currencyCode, interbankRateInr] of Object.entries(liveRates)) {
                const currencyId = currencyMap[currencyCode];
                if (!currencyId)
                    continue;
                const buyRate = +(interbankRateInr * (1 - margin)).toFixed(4);
                const sellRate = +(interbankRateInr * (1 + margin)).toFixed(4);
                upserts.push(this.prisma.exchangeRate.upsert({
                    where: { currencyId },
                    update: {
                        inrRate: interbankRateInr,
                        marginBuyPct: margin,
                        marginSellPct: margin,
                    },
                    create: {
                        currencyId,
                        inrRate: interbankRateInr,
                        marginBuyPct: margin,
                        marginSellPct: margin,
                    },
                }));
            }
            const inrCurrencyId = currencyMap['INR'];
            if (inrCurrencyId) {
                upserts.push(this.prisma.exchangeRate.upsert({
                    where: { currencyId: inrCurrencyId },
                    update: { inrRate: 1, marginBuyPct: 0, marginSellPct: 0 },
                    create: { currencyId: inrCurrencyId, inrRate: 1, marginBuyPct: 0, marginSellPct: 0 },
                }));
            }
            if (upserts.length === 0)
                return;
            await this.prisma.executeWithReconnect(async () => {
                await this.prisma.$transaction(upserts);
            });
            this.logger.log(`Pricing Engine: Updated ${upserts.length} currency quotes.`);
        }
        catch (error) {
            this.logger.error(`Pricing Engine Failed: \n${error.message}`);
        }
    }
    async getAllRates() {
        return this.prisma.exchangeRate.findMany({
            include: { currency: true },
        });
    }
    async updateRate(id, inrRate, marginBuyPct, marginSellPct) {
        const rate = await this.prisma.exchangeRate.update({
            where: { id },
            data: {
                inrRate,
                marginBuyPct,
                marginSellPct
            },
            include: { currency: true }
        });
        await this.prisma.exchangeRateHistory.create({
            data: {
                currencyId: rate.currencyId,
                inrRate
            }
        });
        this.eventBus.publish('LiveRatesUpdated', { rateId: id, inrRate, buyMargin: marginBuyPct });
        return rate;
    }
    async getProducts() {
        return this.prisma.forexProduct.findMany({});
    }
    async updateProduct(id, isActive) {
        return this.prisma.forexProduct.update({
            where: { id },
            data: { isActive }
        });
    }
};
exports.RatesService = RatesService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RatesService.prototype, "handleCron", null);
exports.RatesService = RatesService = RatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fastforex_adapter_1.FastForexAdapter,
        domain_event_bus_service_1.DomainEventBus])
], RatesService);
//# sourceMappingURL=rates.service.js.map