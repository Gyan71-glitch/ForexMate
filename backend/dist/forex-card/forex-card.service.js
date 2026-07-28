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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForexCardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ForexCardService = class ForexCardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async applyForCard(userId, currencyId, balance) {
        return this.prisma.forexCard.create({
            data: {
                cardNumber: `FXC-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                cardVendor: 'VISA',
                userId,
            },
        });
    }
    async getUserCards(userId) {
        return this.prisma.forexCard.findMany({
            where: { userId },
            include: {
                wallets: {
                    include: {
                        currency: true,
                    },
                    orderBy: { balance: 'desc' },
                },
                provider: true,
                transactions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        currency: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCardById(cardId, userId) {
        const card = await this.prisma.forexCard.findFirst({
            where: { id: cardId, userId },
            include: {
                wallets: {
                    include: { currency: true },
                    orderBy: { balance: 'desc' },
                },
                provider: true,
                transactions: {
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                    include: { currency: true },
                },
            },
        });
        if (!card) {
            throw new common_1.NotFoundException(`Card not found`);
        }
        return card;
    }
    async getAllTransactions(userId) {
        return this.prisma.cardTransaction.findMany({
            where: {
                card: { userId },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                currency: true,
                card: {
                    select: { cardNumber: true, cardVendor: true },
                },
            },
        });
    }
    async freezeCard(cardId, userId) {
        const card = await this.prisma.forexCard.findFirst({ where: { id: cardId, userId } });
        if (!card)
            throw new common_1.ForbiddenException('Card not found or not owned by you');
        return this.prisma.forexCard.update({
            where: { id: cardId },
            data: { cardStatus: 'BLOCKED' },
        });
    }
    async unfreezeCard(cardId, userId) {
        const card = await this.prisma.forexCard.findFirst({ where: { id: cardId, userId } });
        if (!card)
            throw new common_1.ForbiddenException('Card not found or not owned by you');
        return this.prisma.forexCard.update({
            where: { id: cardId },
            data: { cardStatus: 'ACTIVE' },
        });
    }
    async reloadCard(cardId, userId, currencyId, amount) {
        const card = await this.prisma.forexCard.findFirst({ where: { id: cardId, userId } });
        if (!card)
            throw new common_1.ForbiddenException('Card not found or not owned by you');
        return this.prisma.cardWallet.upsert({
            where: { cardId_currencyId: { cardId, currencyId } },
            create: { cardId, currencyId, balance: amount },
            update: { balance: { increment: amount } },
        });
    }
};
exports.ForexCardService = ForexCardService;
exports.ForexCardService = ForexCardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ForexCardService);
//# sourceMappingURL=forex-card.service.js.map