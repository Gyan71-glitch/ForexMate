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
exports.WorkflowValidatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkflowValidatorService = class WorkflowValidatorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateTransition(orderId, action) {
        const order = (await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                profile: {
                    include: {
                        user: {
                            include: { KycDocument: true }
                        }
                    }
                },
                payments: true,
                tasks: true,
            }
        }));
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        const docs = order.profile?.user?.KycDocument || [];
        const kycApproved = order.complianceStatus === 'APPROVED' || order.profile?.kycOverallStatus === 'VERIFIED';
        const isPaid = order.status === 'PAYMENT_COMPLETED' || order.payments?.some((p) => p.status === 'SUCCESS');
        switch (action) {
            case 'APPROVE_KYC':
                if (docs.length === 0) {
                    throw new common_1.BadRequestException('Cannot approve KYC: No compliance documents uploaded.');
                }
                break;
            case 'REJECT_KYC':
                if (docs.length === 0) {
                    throw new common_1.BadRequestException('Cannot reject KYC: No compliance documents uploaded.');
                }
                break;
            case 'RESERVE_CURRENCY':
                if (!kycApproved) {
                    throw new common_1.BadRequestException('Cannot reserve inventory: KYC is not yet approved.');
                }
                break;
            case 'MARK_READY':
                if (!kycApproved) {
                    throw new common_1.BadRequestException('Cannot mark ready: KYC is not yet approved.');
                }
                const inventoryTask = order.tasks?.find((t) => t.taskType === 'INVENTORY_PREP');
                if (inventoryTask && inventoryTask.status !== 'COMPLETED') {
                    throw new common_1.BadRequestException('Cannot mark ready: Inventory has not been confirmed/reserved.');
                }
                break;
            case 'COMPLETE_HANDOVER':
                if (!kycApproved) {
                    throw new common_1.BadRequestException('Cannot complete handover: KYC is not yet approved.');
                }
                if (!isPaid) {
                    throw new common_1.BadRequestException('Cannot complete handover: Order payment is pending.');
                }
                const prepTask = order.tasks?.find((t) => t.taskType === 'INVENTORY_PREP');
                if (prepTask && prepTask.status !== 'COMPLETED') {
                    throw new common_1.BadRequestException('Cannot complete handover: Inventory prep task is not completed.');
                }
                break;
            default:
                break;
        }
        return order;
    }
};
exports.WorkflowValidatorService = WorkflowValidatorService;
exports.WorkflowValidatorService = WorkflowValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowValidatorService);
//# sourceMappingURL=workflow-validator.service.js.map