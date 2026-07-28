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
var PublicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicService = PublicService_1 = class PublicService {
    prisma;
    logger = new common_1.Logger(PublicService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLiveRates() {
        return this.prisma.exchangeRate.findMany({
            include: {
                currency: true
            },
            orderBy: {
                currencyId: 'asc'
            }
        });
    }
    async getActiveCurrencies() {
        return this.prisma.currency.findMany({
            where: {
                rates: { isNot: null }
            },
            select: {
                id: true,
                code: true,
                name: true,
                symbol: true,
            },
            orderBy: { code: 'asc' }
        });
    }
    async getActiveBranches() {
        return this.prisma.branch.findMany({
            select: {
                id: true,
                branchCode: true,
                branchName: true,
                branchAddress: true,
                branchCity: true,
                workingHours: true,
            },
            orderBy: {
                branchCode: 'desc'
            }
        });
    }
    async getTestimonials() {
        return this.prisma.testimonial.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }
    async getRemittancePurposes() {
        return this.prisma.transferPurpose.findMany({
            where: { isActive: true },
            include: { documentRequirements: true },
            orderBy: { name: 'asc' },
        });
    }
    async getRemittanceCountries() {
        return this.prisma.countryConfiguration.findMany({
            where: { isActive: true },
            include: { feeConfigurations: true },
            orderBy: { countryName: 'asc' },
        });
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = PublicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map