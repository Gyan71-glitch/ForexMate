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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let KycController = class KycController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRequirements(orderId) {
        if (!orderId) {
            return { requiredDocuments: [] };
        }
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { profile: true }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.productType === 'REMITTANCE') {
            const rd = await this.prisma.remittanceDetail.findFirst({
                where: { orderItem: { orderId } },
                include: { purpose: { include: { documentRequirements: true } } }
            });
            const dbDocs = rd?.purpose?.documentRequirements?.map((d) => d.docType) || [];
            if (dbDocs.length > 0) {
                return { requiredDocuments: dbDocs };
            }
            return {
                requiredDocuments: ['PAN', 'PASSPORT', 'VISA', 'ADMISSION_INVOICE', 'BANK_STATEMENT', 'FORM_A2']
            };
        }
        const purpose = order.profile?.travelPurpose || 'TOURISM';
        let rules = await this.prisma.kycVerificationRule.findMany({
            where: {
                isActive: true,
                required: true,
                OR: [
                    { product: null },
                    { product: order.productType }
                ],
                AND: [
                    {
                        OR: [
                            { purpose: null },
                            { purpose }
                        ]
                    }
                ]
            }
        });
        if (order.productType === 'CASH_SELL') {
            rules = rules.filter(r => r.docType === 'PAN' || r.docType === 'PASSPORT');
        }
        return {
            requiredDocuments: rules.map(r => r.docType)
        };
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('requirements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dynamic KYC requirements for an order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Required documents returned' }),
    __param(0, (0, common_1.Query)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getRequirements", null);
exports.KycController = KycController = __decorate([
    (0, swagger_1.ApiTags)('KYC'),
    (0, common_1.Controller)('kyc'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KycController);
//# sourceMappingURL=kyc.controller.js.map