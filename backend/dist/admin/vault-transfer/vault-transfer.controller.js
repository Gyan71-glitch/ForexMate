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
exports.VaultTransferController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vault_transfer_service_1 = require("./vault-transfer.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/permissions.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
let VaultTransferController = class VaultTransferController {
    transferService;
    constructor(transferService) {
        this.transferService = transferService;
    }
    getAllTransfers() {
        return this.transferService.getAllTransfers();
    }
    createTransfer(dto, req) {
        return this.transferService.createTransfer(req.user.id, dto);
    }
};
exports.VaultTransferController = VaultTransferController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VaultTransferController.prototype, "getAllTransfers", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VaultTransferController.prototype, "createTransfer", null);
exports.VaultTransferController = VaultTransferController = __decorate([
    (0, swagger_1.ApiTags)('Admin / Vault Transfers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('admin/vault-transfers'),
    __metadata("design:paramtypes", [vault_transfer_service_1.VaultTransferService])
], VaultTransferController);
//# sourceMappingURL=vault-transfer.controller.js.map