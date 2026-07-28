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
exports.OpsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ops_service_1 = require("./ops.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const branch_scope_guard_1 = require("../common/guards/branch-scope.guard");
let OpsController = class OpsController {
    opsService;
    constructor(opsService) {
        this.opsService = opsService;
    }
    getBranchTasks(req) {
        const branchId = req.user?.branchId;
        return this.opsService.getBranchTasks(branchId);
    }
    getBranchOrders(req) {
        const branchId = req.user?.branchId;
        if (!branchId)
            throw new common_1.BadRequestException('No branch associated with user');
        return this.opsService.getBranchOrders(branchId);
    }
    getBranchVaults(req) {
        const branchId = req.user?.branchId;
        if (!branchId)
            throw new common_1.BadRequestException('No branch associated with user');
        return this.opsService.getBranchVaults(branchId);
    }
    resolveTask(id, data, req) {
        return this.opsService.resolveTask(id, req.user, data);
    }
    claimTask(id, req) {
        return this.opsService.claimTask(id, req.user);
    }
    getBranchLeads(req) {
        return this.opsService.getBranchLeads(null, req.user);
    }
    claimLead(id, req) {
        return this.opsService.claimLead(id, req.user);
    }
    processLeadAction(id, data, req) {
        return this.opsService.processLeadAction(id, data.action, data.notes || '', req.user);
    }
    reassignLead(id, data, req) {
        return this.opsService.reassignLead(id, data.staffId, req.user);
    }
    getBranchStaff(req) {
        const branchId = req.user?.branchId;
        return this.opsService.getBranchStaff(branchId);
    }
    getBranchCashiers(req) {
        const branchId = req.user?.branchId;
        return this.opsService.getBranchCashiers(branchId);
    }
    getBranchDeliveryPartners(req) {
        const branchId = req.user?.branchId;
        return this.opsService.getBranchDeliveryPartners(branchId);
    }
    assignFulfillment(id, data, req) {
        return this.opsService.assignFulfillment(id, data, req.user);
    }
    forwardRemittance(id, data, req) {
        return this.opsService.forwardRemittanceToPartner(id, data, req.user);
    }
    updateRemittanceStatus(id, data, req) {
        return this.opsService.updateRemittancePartnerStatus(id, data, req.user);
    }
    sendToBranch(id, data, req) {
        return this.opsService.sendToBranch(id, data, req.user);
    }
    getSameCityBranches(branchId) {
        return this.opsService.getSameCityBranches(branchId);
    }
    reassignBranch(id, data, req) {
        return this.opsService.reassignBranch(id, data, req.user);
    }
    getCityInventoryComparison(id) {
        return this.opsService.getCityBranchInventoryComparison(id);
    }
    smartAssignBranch(id, data, req) {
        return this.opsService.smartAssignBranch(id, data, req.user);
    }
};
exports.OpsController = OpsController;
__decorate([
    (0, common_1.Get)('tasks'),
    (0, swagger_1.ApiOperation)({ summary: 'List tasks for the assigned branch' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getBranchTasks", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'List orders for the assigned branch' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getBranchOrders", null);
__decorate([
    (0, common_1.Get)('branch-vaults'),
    (0, swagger_1.ApiOperation)({ summary: 'List vaults for the assigned branch' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getBranchVaults", null);
__decorate([
    (0, common_1.Post)('tasks/:id/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve a branch task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "resolveTask", null);
__decorate([
    (0, common_1.Post)('tasks/:id/claim'),
    (0, swagger_1.ApiOperation)({ summary: 'Claim a branch task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "claimTask", null);
__decorate([
    (0, common_1.Get)('leads'),
    (0, swagger_1.ApiOperation)({ summary: 'List CRM leads for the assigned branch' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getBranchLeads", null);
__decorate([
    (0, common_1.Post)('leads/:id/claim'),
    (0, swagger_1.ApiOperation)({ summary: 'Claim a lead/order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "claimLead", null);
__decorate([
    (0, common_1.Post)('leads/:id/action'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform checklists action on lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "processLeadAction", null);
__decorate([
    (0, common_1.Post)('leads/:id/reassign'),
    (0, swagger_1.ApiOperation)({ summary: 'Reassign a lead to another staff member (Manager/Admin Only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "reassignLead", null);
__decorate([
    (0, common_1.Get)('staff'),
    (0, swagger_1.ApiOperation)({ summary: 'List all staff members in the current branch' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getBranchStaff", null);
__decorate([
    (0, common_1.Get)('cashiers'),
    (0, swagger_1.ApiOperation)({ summary: 'List all cashiers in the current branch' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getBranchCashiers", null);
__decorate([
    (0, common_1.Get)('delivery-partners'),
    (0, swagger_1.ApiOperation)({ summary: 'List all delivery partners in the current branch' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getBranchDeliveryPartners", null);
__decorate([
    (0, common_1.Post)('leads/:id/assign-fulfillment'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign or reassign cashier/delivery partner to order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "assignFulfillment", null);
__decorate([
    (0, common_1.Post)('orders/:id/forward-remittance'),
    (0, swagger_1.ApiOperation)({ summary: 'Forward a verified remittance order to a partner dealer' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "forwardRemittance", null);
__decorate([
    (0, common_1.Post)('orders/:id/update-remittance-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update processing status for a forwarded remittance order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "updateRemittanceStatus", null);
__decorate([
    (0, common_1.Post)('orders/:id/send-to-branch'),
    (0, swagger_1.ApiOperation)({ summary: 'Send order to branch after central compliance completion' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "sendToBranch", null);
__decorate([
    (0, common_1.Get)('branches/same-city/:branchId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get branches in the same city as specified branch' }),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getSameCityBranches", null);
__decorate([
    (0, common_1.Post)('orders/:id/reassign-branch'),
    (0, swagger_1.ApiOperation)({ summary: 'Reassign order to a same-city branch with reason' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "reassignBranch", null);
__decorate([
    (0, common_1.Get)('orders/:id/city-inventory-comparison'),
    (0, swagger_1.ApiOperation)({ summary: 'Get city-wide branch inventory analysis and smart branch ranking for an order' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getCityInventoryComparison", null);
__decorate([
    (0, common_1.Post)('orders/:id/smart-assign-branch'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign or reassign an order to a target branch based on city inventory analysis' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "smartAssignBranch", null);
exports.OpsController = OpsController = __decorate([
    (0, swagger_1.ApiTags)('Branch Operations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_scope_guard_1.BranchScopeGuard),
    (0, common_1.Controller)('ops'),
    __metadata("design:paramtypes", [ops_service_1.OpsService])
], OpsController);
//# sourceMappingURL=ops.controller.js.map