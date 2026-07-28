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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const transaction_service_1 = require("./transaction.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const swagger_1 = require("@nestjs/swagger");
let TransactionController = class TransactionController {
    transactionService;
    prisma;
    constructor(transactionService, prisma) {
        this.transactionService = transactionService;
        this.prisma = prisma;
    }
    createTransaction(data, req) {
        return this.transactionService.createTransaction({
            ...data,
            userId: req.user.id,
        });
    }
    async getUserTransactions(id, req) {
        const requestedId = id;
        const userRole = await this.prisma.role.findUnique({
            where: { id: req.user.roleId },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        const userPermissions = userRole?.permissions.map((rp) => rp.permission.action) || [];
        const canReadAll = userPermissions.includes('orders:read:all');
        const canReadOwn = userPermissions.includes('orders:read:own') && req.user.id === requestedId;
        if (!canReadAll && !canReadOwn) {
            throw new common_1.ForbiddenException('You do not have permission to view these transactions.');
        }
        return this.transactionService.getUserTransactions(requestedId);
    }
    getAllTransactions() {
        return this.transactionService.getAllTransactions();
    }
    updateStatus(id, body, req) {
        return this.transactionService.updateStatus(id, body.status, req.user.id);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('orders:read:own'),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new transaction (Legacy)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('user/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions for a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User transactions retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getUserTransactions", null);
__decorate([
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('orders:read:all'),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All transactions retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('orders:update:status'),
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transaction status (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "updateStatus", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('Transactions (Legacy)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService,
        prisma_service_1.PrismaService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map