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
var QuotesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuotesService = QuotesService_1 = class QuotesService {
    prisma;
    logger = new common_1.Logger(QuotesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateQuote(userId, dto) {
        if (dto.branchId) {
            const branch = await this.prisma.branch.findUnique({
                where: { id: dto.branchId },
            });
            if (!branch) {
                throw new common_1.BadRequestException(`Branch with id '${dto.branchId}' not found`);
            }
        }
        const currency = await this.prisma.currency.findUnique({
            where: { code: dto.currency },
            include: { rates: true }
        });
        if (!currency || !currency.rates) {
            throw new common_1.BadRequestException(`No active exchange rate for currency ${dto.currency}`);
        }
        const exchangeRate = currency.rates;
        const baseRate = exchangeRate.inrRate;
        let margin = 0;
        let rate = baseRate;
        let lockedRate = rate;
        if (dto.product === 'CASH_SELL') {
            margin = exchangeRate.marginSellPct + 0.005;
            rate = baseRate * (1 - margin);
            lockedRate = rate * 0.99;
        }
        else {
            if (dto.product === 'CASH')
                margin = exchangeRate.marginBuyPct + 0.005;
            if (dto.product === 'CARD')
                margin = exchangeRate.marginBuyPct;
            if (dto.product === 'REMITTANCE')
                margin = exchangeRate.marginBuyPct - 0.002;
            rate = baseRate * (1 + margin);
            lockedRate = rate * 1.01;
        }
        let profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            profile = await this.prisma.customerProfile.create({
                data: { userId }
            });
        }
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const quoteNumber = `QTE-${Math.floor(100000 + Math.random() * 900000)}`;
        const quote = await this.prisma.quote.create({
            data: {
                quoteNumber,
                profileId: profile.id,
                sessionId: dto.sessionId || null,
                currencyId: currency.id,
                lockedInrRate: lockedRate,
                amountForeign: dto.amount,
                expiresAt,
                status: 'ACTIVE'
            }
        });
        this.logger.log(`Generated Quote ${quote.quoteNumber} for profile ${profile.id} in session ${dto.sessionId}`);
        return {
            quoteId: quote.id,
            quoteNumber: quote.quoteNumber,
            currency: dto.currency,
            lockedInrRate: Number(lockedRate.toFixed(4)),
            amountForeign: dto.amount,
            totalInr: Number((lockedRate * dto.amount).toFixed(2)),
            expiresAt,
            timeRemainingMinutes: 15
        };
    }
};
exports.QuotesService = QuotesService;
exports.QuotesService = QuotesService = QuotesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotesService);
//# sourceMappingURL=quotes.service.js.map