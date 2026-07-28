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
var TreasuryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreasuryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TreasuryService = TreasuryService_1 = class TreasuryService {
    prisma;
    logger = new common_1.Logger(TreasuryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async executeInterbankTrade(currencyCode, tradeType, amount, rate, bankName) {
        const currency = await this.prisma.currency.findUnique({ where: { code: currencyCode } });
        if (!currency)
            throw new common_1.BadRequestException(`Currency ${currencyCode} not found`);
        return this.prisma.$transaction(async (tx) => {
            const trade = await tx.interbankTrade.create({
                data: {
                    currencyId: currency.id,
                    tradeType,
                    amount,
                    rate,
                    bankName,
                }
            });
            let position = await tx.dealerPosition.findUnique({ where: { currencyId: currency.id } });
            if (!position) {
                position = await tx.dealerPosition.create({
                    data: { currencyId: currency.id }
                });
            }
            const amountDecimal = Number(amount);
            const isBuy = tradeType === 'BUY';
            const totalBought = Number(position.totalBought) + (isBuy ? amountDecimal : 0);
            const totalSold = Number(position.totalSold) + (isBuy ? 0 : amountDecimal);
            const netOpenPosition = totalBought - totalSold;
            await tx.dealerPosition.update({
                where: { id: position.id },
                data: {
                    totalBought,
                    totalSold,
                    netOpenPosition
                }
            });
            this.logger.log(`Executed Interbank ${tradeType} for ${amount} ${currencyCode} with ${bankName}`);
            return trade;
        });
    }
    async getDealerPositions() {
        return this.prisma.dealerPosition.findMany({
            include: { currency: true }
        });
    }
};
exports.TreasuryService = TreasuryService;
exports.TreasuryService = TreasuryService = TreasuryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TreasuryService);
//# sourceMappingURL=treasury.service.js.map