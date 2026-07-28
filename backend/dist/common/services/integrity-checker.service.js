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
var IntegrityCheckerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrityCheckerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let IntegrityCheckerService = IntegrityCheckerService_1 = class IntegrityCheckerService {
    prisma;
    logger = new common_1.Logger(IntegrityCheckerService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async runIntegrityChecks() {
        const issues = [];
        const paidOrders = await this.prisma.order.findMany({
            where: { status: { in: ['PAYMENT_COMPLETED', 'COMPLETED', 'DELIVERED'] } },
            include: { invoices: { include: { receipts: true } }, payments: true }
        });
        for (const order of paidOrders) {
            const hasSuccessPayment = order.payments.some(p => p.status === 'SUCCESS');
            if (!hasSuccessPayment) {
                issues.push({
                    type: 'MISSING_PAYMENT_RECORD',
                    severity: 'CRITICAL',
                    entityId: order.id,
                    message: `Order ${order.orderNumber} is marked paid, but has no SUCCESS payment record.`,
                });
            }
            if (order.invoices.length === 0) {
                issues.push({
                    type: 'MISSING_INVOICE',
                    severity: 'WARNING',
                    entityId: order.id,
                    message: `Order ${order.orderNumber} is paid but has no Invoice generated in the database.`,
                });
            }
            else {
                const invoice = order.invoices[0];
                if (invoice.receipts.length === 0) {
                    issues.push({
                        type: 'MISSING_RECEIPT',
                        severity: 'WARNING',
                        entityId: order.id,
                        message: `Order ${order.orderNumber} has an invoice, but lacks an InvoiceReceipt.`,
                    });
                }
            }
        }
        const vaults = await this.prisma.branchVault.findMany({});
        for (const vault of vaults) {
            if (vault.totalAmount.toNumber() < 0) {
                issues.push({
                    type: 'NEGATIVE_VAULT_BALANCE',
                    severity: 'CRITICAL',
                    entityId: vault.id,
                    message: `Branch Vault ${vault.id} has a negative balance of ${vault.totalAmount}.`,
                });
            }
        }
        const activeOrders = await this.prisma.order.findMany({
            where: { status: { notIn: ['CANCELLED', 'REJECTED'] } },
            include: { tasks: true }
        });
        for (const order of activeOrders) {
            if (order.requiresKyc && !order.tasks.some(t => t.taskType === 'KYC_REVIEW')) {
                issues.push({
                    type: 'MISSING_KYC_TASK',
                    severity: 'CRITICAL',
                    entityId: order.id,
                    message: `Order ${order.orderNumber} requires KYC but has no KYC_REVIEW task in the branch queue.`,
                });
            }
            if (order.requiresInventory && !order.tasks.some(t => t.taskType === 'INVENTORY_PREP')) {
                issues.push({
                    type: 'MISSING_INVENTORY_TASK',
                    severity: 'CRITICAL',
                    entityId: order.id,
                    message: `Order ${order.orderNumber} requires inventory prep but has no INVENTORY_PREP task.`,
                });
            }
        }
        this.logger.log(`Integrity Check finished. Healthy: ${issues.length === 0}. Found ${issues.length} issues.`);
        return {
            healthy: issues.length === 0,
            issues,
        };
    }
};
exports.IntegrityCheckerService = IntegrityCheckerService;
exports.IntegrityCheckerService = IntegrityCheckerService = IntegrityCheckerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntegrityCheckerService);
//# sourceMappingURL=integrity-checker.service.js.map