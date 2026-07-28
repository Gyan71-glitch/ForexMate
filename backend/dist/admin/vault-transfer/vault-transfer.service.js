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
exports.VaultTransferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let VaultTransferService = class VaultTransferService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllTransfers() {
        return this.prisma.vaultTransfer.findMany({
            include: {
                sourceBranch: { select: { id: true, branchName: true, branchCode: true, branchCity: true } },
                destBranch: { select: { id: true, branchName: true, branchCode: true, branchCity: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async createTransfer(userId, dto) {
        if (dto.sourceBranchId === dto.destBranchId) {
            throw new common_1.BadRequestException('Source and Destination branch cannot be the same.');
        }
        if (dto.quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0.');
        }
        const [sourceBranch, destBranch] = await Promise.all([
            this.prisma.branch.findUnique({ where: { id: dto.sourceBranchId } }),
            this.prisma.branch.findUnique({ where: { id: dto.destBranchId } }),
        ]);
        if (!sourceBranch || !destBranch) {
            throw new common_1.NotFoundException('Source or destination branch not found.');
        }
        const transferNumber = `VT-${Date.now()}`;
        return this.prisma.$transaction(async (tx) => {
            const transfer = await tx.vaultTransfer.create({
                data: {
                    transferNumber,
                    sourceBranchId: dto.sourceBranchId,
                    destBranchId: dto.destBranchId,
                    currencyCode: dto.currencyCode,
                    quantity: new client_1.Prisma.Decimal(dto.quantity),
                    reason: dto.reason,
                    requestedById: userId,
                    approvedById: userId,
                    status: 'APPROVED',
                },
            });
            const sourceInv = await tx.branchInventory.findFirst({
                where: { branchId: dto.sourceBranchId, currencyCode: dto.currencyCode },
            });
            if (sourceInv) {
                await tx.branchInventory.update({
                    where: { id: sourceInv.id },
                    data: { availableAmount: { decrement: dto.quantity } },
                });
            }
            const destInv = await tx.branchInventory.findFirst({
                where: { branchId: dto.destBranchId, currencyCode: dto.currencyCode },
            });
            if (destInv) {
                await tx.branchInventory.update({
                    where: { id: destInv.id },
                    data: { availableAmount: { increment: dto.quantity } },
                });
            }
            await tx.auditLog.create({
                data: {
                    action: 'VAULT_TRANSFER_EXECUTED',
                    entityName: 'VaultTransfer',
                    entityId: transfer.id,
                    branchId: dto.sourceBranchId,
                    newData: {
                        transferNumber,
                        sourceBranch: sourceBranch.branchName,
                        destBranch: destBranch.branchName,
                        currencyCode: dto.currencyCode,
                        quantity: dto.quantity,
                        reason: dto.reason,
                    },
                },
            });
            return transfer;
        });
    }
};
exports.VaultTransferService = VaultTransferService;
exports.VaultTransferService = VaultTransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VaultTransferService);
//# sourceMappingURL=vault-transfer.service.js.map