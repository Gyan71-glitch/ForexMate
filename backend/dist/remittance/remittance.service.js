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
exports.RemittanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RemittanceService = class RemittanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyRemittances(userId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId },
        });
        if (!profile)
            return [];
        return this.prisma.order.findMany({
            where: {
                profileId: profile.id,
                items: {
                    some: {
                        remittance: { isNot: null },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    where: { remittance: { isNot: null } },
                    include: {
                        currency: true,
                        product: true,
                        remittance: {
                            include: { partner: true },
                        },
                    },
                },
            },
        });
    }
    async getRemittanceById(orderId, userId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                profileId: profile.id,
                items: { some: { remittance: { isNot: null } } },
            },
            include: {
                branch: true,
                items: {
                    where: { remittance: { isNot: null } },
                    include: {
                        currency: true,
                        product: true,
                        remittance: {
                            include: { partner: true, purpose: true },
                        },
                    },
                },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Remittance not found');
        return order;
    }
    async getPartners() {
        return this.prisma.remittancePartner.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getPurposes() {
        return this.prisma.transferPurpose.findMany({
            where: { isActive: true },
            include: { documentRequirements: true },
            orderBy: { name: 'asc' },
        });
    }
    async getCountries() {
        return this.prisma.countryConfiguration.findMany({
            where: { isActive: true },
            include: { feeConfigurations: true },
            orderBy: { countryName: 'asc' },
        });
    }
    async calculate(userId, query) {
        const { amount, currency: currencyCode, countryCode, purposeCode, direction = 'RECEIVE' } = query;
        if (!amount || amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than zero');
        }
        const currency = await this.prisma.currency.findUnique({
            where: { code: currencyCode },
            include: { rates: true }
        });
        if (!currency || !currency.rates) {
            throw new common_1.BadRequestException(`No active exchange rate for currency ${currencyCode}`);
        }
        const purpose = await this.prisma.transferPurpose.findUnique({
            where: { code: purposeCode }
        });
        if (!purpose) {
            throw new common_1.BadRequestException(`Invalid purpose code: ${purposeCode}`);
        }
        const profile = userId ? await this.prisma.customerProfile.findUnique({
            where: { userId }
        }) : null;
        const currentYear = new Date().getFullYear();
        const financialYear = `${currentYear}-${currentYear + 1}`;
        const lrsTracker = profile ? await this.prisma.lrsLimitTracker.findUnique({
            where: {
                profileId_financialYear: {
                    profileId: profile.id,
                    financialYear
                }
            }
        }) : null;
        const trackerSpentUsd = lrsTracker
            ? Number(lrsTracker.declaredAmountUsd || 0) + Number(lrsTracker.systemSpentAmountUsd || 0)
            : 0;
        const trackerSpentInr = trackerSpentUsd * 83;
        const activeOrders = profile ? await this.prisma.order.findMany({
            where: {
                profileId: profile.id,
                status: { notIn: ['CANCELLED', 'REJECTED'] }
            }
        }) : [];
        const activeOrdersInr = activeOrders.reduce((sum, o) => sum + Number(o.totalAmountInr || 0), 0);
        const cumulativeSpentInr = trackerSpentInr + activeOrdersInr;
        const baseRate = Number(currency.rates.inrRate);
        const margin = Number(currency.rates.marginBuyPct) - 0.002;
        const rate = baseRate * (1 + margin);
        const lockedRate = rate * 1.01;
        let inrSubtotal = 0;
        let foreignAmount = 0;
        if (direction === 'RECEIVE') {
            foreignAmount = amount;
            inrSubtotal = foreignAmount * lockedRate;
        }
        else {
            inrSubtotal = amount;
            foreignAmount = inrSubtotal / lockedRate;
        }
        const feeConfig = await this.prisma.transferFeeConfiguration.findFirst({
            where: {
                country: { countryCode },
                minAmountInr: { lte: inrSubtotal },
                maxAmountInr: { gte: inrSubtotal }
            }
        });
        const feeAmount = feeConfig ? feeConfig.feeAmountInr.toNumber() : 500;
        const threshold = Number(purpose.tcsThreshold);
        const rateBelow = Number(purpose.tcsRateBelow) / 100;
        const rateAbove = Number(purpose.tcsRateAbove) / 100;
        let tcsAmount = 0;
        if (cumulativeSpentInr >= threshold) {
            tcsAmount = inrSubtotal * rateAbove;
        }
        else if (cumulativeSpentInr + inrSubtotal <= threshold) {
            tcsAmount = inrSubtotal * rateBelow;
        }
        else {
            const amountBelow = threshold - cumulativeSpentInr;
            const amountAbove = inrSubtotal - amountBelow;
            tcsAmount = (amountBelow * rateBelow) + (amountAbove * rateAbove);
        }
        const totalInr = inrSubtotal + feeAmount + tcsAmount;
        return {
            exchangeRate: Number(lockedRate.toFixed(4)),
            foreignAmount: Number(foreignAmount.toFixed(2)),
            inrSubtotal: Number(inrSubtotal.toFixed(2)),
            feeAmount: Number(feeAmount.toFixed(2)),
            tcsAmount: Number(tcsAmount.toFixed(2)),
            totalInr: Number(totalInr.toFixed(2)),
            thresholdExceeded: cumulativeSpentInr + inrSubtotal > threshold,
            cumulativeSpentInr,
            purposeCode
        };
    }
    async getBeneficiaries(userId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        return this.prisma.beneficiary.findMany({
            where: { profileId: profile.id },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createBeneficiary(userId, data) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const { name, bankName, swiftCode, ibanOrAccountNumber, address, country } = data;
        const existing = await this.prisma.beneficiary.findFirst({
            where: {
                profileId: profile.id,
                ibanOrAccountNumber: ibanOrAccountNumber.trim(),
                swiftCode: swiftCode.trim().toUpperCase(),
            }
        });
        if (existing) {
            return existing;
        }
        return this.prisma.beneficiary.create({
            data: {
                profileId: profile.id,
                name: name.trim(),
                bankName: bankName.trim(),
                swiftCode: swiftCode.trim().toUpperCase(),
                ibanOrAccountNumber: ibanOrAccountNumber.trim(),
                address: address?.trim() || '',
                country: country?.trim() || '',
            }
        });
    }
    async deleteBeneficiary(userId, id) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const beneficiary = await this.prisma.beneficiary.findFirst({
            where: { id, profileId: profile.id }
        });
        if (!beneficiary)
            throw new common_1.NotFoundException('Beneficiary not found');
        await this.prisma.beneficiary.delete({
            where: { id }
        });
        return { success: true };
    }
};
exports.RemittanceService = RemittanceService;
exports.RemittanceService = RemittanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemittanceService);
//# sourceMappingURL=remittance.service.js.map