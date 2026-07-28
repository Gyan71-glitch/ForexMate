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
exports.MasterDataService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MasterDataService = class MasterDataService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAggregatedMasterData() {
        const [currencies, countries, branches, products, purposeCodes, taxes, fees, marginRules] = await Promise.all([
            this.prisma.currency.findMany({ where: { isActive: true } }),
            this.prisma.country.findMany(),
            this.prisma.branch.findMany(),
            this.prisma.forexProduct.findMany({ where: { isActive: true } }),
            this.prisma.purposeCode.findMany({ include: { complianceRules: true } }),
            this.prisma.taxRule.findMany({ where: { isActive: true } }),
            this.prisma.feeStructure.findMany({ where: { isActive: true } }),
            this.prisma.exchangeRateMarginRule.findMany(),
        ]);
        return {
            currencies,
            countries,
            branches,
            products,
            purposeCodes,
            taxes,
            fees,
            marginRules
        };
    }
    async addBranch(dto) {
        const existing = await this.prisma.branch.findUnique({
            where: { branchCode: dto.code }
        });
        if (existing) {
            throw new common_1.BadRequestException('Branch code already exists');
        }
        const defaultCompany = await this.prisma.company.findFirst();
        if (!defaultCompany)
            throw new common_1.BadRequestException('No company configured in system');
        return this.prisma.branch.create({
            data: {
                companyId: defaultCompany.id,
                branchName: dto.name,
                branchCode: dto.code,
                branchAddress: 'TBD',
                branchCity: 'TBD',
            }
        });
    }
    async addCurrency(dto) {
        const existing = await this.prisma.currency.findUnique({
            where: { code: dto.code }
        });
        if (existing) {
            throw new common_1.BadRequestException('Currency code already exists');
        }
        return this.prisma.currency.create({
            data: {
                code: dto.code,
                name: dto.name,
                symbol: dto.code,
                isActive: true,
            }
        });
    }
};
exports.MasterDataService = MasterDataService;
exports.MasterDataService = MasterDataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MasterDataService);
//# sourceMappingURL=master-data.service.js.map