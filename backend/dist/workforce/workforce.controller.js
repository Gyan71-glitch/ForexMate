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
exports.WorkforceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workforce_service_1 = require("./workforce.service");
const workforce_dto_1 = require("./dto/workforce.dto");
const workforce_jwt_guard_1 = require("./guards/workforce-jwt.guard");
let WorkforceController = class WorkforceController {
    workforceService;
    constructor(workforceService) {
        this.workforceService = workforceService;
    }
    login(dto) {
        return this.workforceService.login(dto);
    }
    changePassword(dto, req) {
        return this.workforceService.changePassword(req.user.id, dto);
    }
    getMe(req) {
        return this.workforceService.getProfile(req.user.id);
    }
    getOrders(req) {
        return this.workforceService.getAssignedOrders(req.user.id, req.user.role);
    }
    getHistory(req) {
        return this.workforceService.getHistory(req.user.id, req.user.role);
    }
    getCityInventory(req) {
        return this.workforceService.getCityInventory(req.user.id);
    }
    getOrder(id, req) {
        return this.workforceService.getOrderDetail(id, req.user.id, req.user.role);
    }
    sendOtp(id, dto, req) {
        return this.workforceService.sendCustomerOtp(id, dto, req.user.id, req.user.role);
    }
    verifyOtp(id, dto, req) {
        return this.workforceService.verifyCustomerOtp(id, dto, req.user.id, req.user.role);
    }
    reassignBranch(id, dto, req) {
        return this.workforceService.reassignBranch(id, req.user.id, dto);
    }
    managerCompletePickup(id, dto, req) {
        return this.workforceService.completePickupByManager(id, req.user.id, dto);
    }
    assignDeliveryPartner(id, dto, req) {
        return this.workforceService.assignDeliveryPartner(id, req.user.id, dto);
    }
    receiveBranchInventory(dto, req) {
        return this.workforceService.receiveBranchInventory(req.user.id, dto);
    }
    completePickup(id, req) {
        return this.workforceService.completePickup(id, req.user.id);
    }
    completeCashSell(id, dto, req) {
        return this.workforceService.completeCashSell(id, req.user.id);
    }
    reachedCustomer(id, req) {
        return this.workforceService.reachedCustomer(id, req.user.id);
    }
    completeDelivery(id, dto, req) {
        return this.workforceService.completeDelivery(id, dto, req.user.id);
    }
    allocateCash(id, body, req) {
        return this.workforceService.allocateCash(id, req.user.id, body.items);
    }
    getManagerDashboard(req) {
        return this.workforceService.getManagerDashboard(req.user.id);
    }
    getDeliveryPartners(req) {
        return this.workforceService.getDeliveryPartners(req.user.id);
    }
    getManagerReports(req) {
        return this.workforceService.getManagerReports(req.user.id);
    }
    getManagerTimeline(req) {
        return this.workforceService.getManagerTimeline(req.user.id);
    }
    holdOrder(id, body, req) {
        return this.workforceService.holdOrder(id, req.user.id, body.reason);
    }
    escalateOrder(id, body, req) {
        return this.workforceService.escalateOrder(id, req.user.id, body.reason);
    }
    reportFraud(id, body, req) {
        return this.workforceService.reportFraud(id, req.user.id, body.reason);
    }
    cancelPickup(id, body, req) {
        return this.workforceService.cancelPickup(id, req.user.id, body.reason);
    }
};
exports.WorkforceController = WorkforceController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('auth/login'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee login with Employee ID and password' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [workforce_dto_1.WorkforceLoginDto]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "login", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('auth/change-password'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change employee password (first login or manual)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [workforce_dto_1.WorkforceChangePasswordDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current employee profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders assigned to the logged-in employee/manager' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/history'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get completed/cancelled order history' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('city-inventory'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory for all branches in the same city (Branch Manager)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getCityInventory", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get single order details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getOrder", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/send-otp'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP to customer for handover verification' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workforce_dto_1.SendCustomerOtpDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/verify-otp'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Verify customer OTP code entered by employee' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workforce_dto_1.VerifyCustomerOtpDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/reassign-branch'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reassign order to another branch inside the same city (Branch Manager)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workforce_dto_1.ReassignBranchDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "reassignBranch", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/manager-complete-pickup'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Complete pickup handover with photo proof (Branch Manager)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workforce_dto_1.ManagerCompletePickupDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "managerCompletePickup", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/assign-delivery-partner'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign delivery partner for home delivery (Branch Manager)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workforce_dto_1.AssignDeliveryPartnerDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "assignDeliveryPartner", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('manager/inventory/receive'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Receive vault inventory stock with mandatory evidence (Branch Manager)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [workforce_dto_1.ReceiveBranchInventoryDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "receiveBranchInventory", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/complete-pickup'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Complete pickup handover' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "completePickup", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/complete-cash-sell'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Complete cash sell transaction' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workforce_dto_1.CompleteCashSellDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "completeCashSell", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/reached-customer'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mark delivery partner has reached customer' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "reachedCustomer", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/complete-delivery'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Complete delivery with signature and photo proof' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workforce_dto_1.CompleteDeliveryDto, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "completeDelivery", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/allocate-cash'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Branch Manager denomination cash allocation & reservation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "allocateCash", null);
__decorate([
    (0, common_1.Get)('manager/dashboard'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Branch Manager aggregate metrics and dashboard' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getManagerDashboard", null);
__decorate([
    (0, common_1.Get)('manager/delivery-partners'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get roster and status of Delivery Partners for branch/city' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getDeliveryPartners", null);
__decorate([
    (0, common_1.Get)('manager/reports'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get branch performance reports and analytics' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getManagerReports", null);
__decorate([
    (0, common_1.Get)('manager/timeline'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get branch activity and audit event timeline' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "getManagerTimeline", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/hold'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Hold order by Branch Manager' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "holdOrder", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/escalate'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Escalate order issue to Central Operations' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "escalateOrder", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/report-fraud'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Report fraud or suspicious activity on order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "reportFraud", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('orders/:id/cancel-pickup'),
    (0, common_1.UseGuards)(workforce_jwt_guard_1.WorkforceJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel counter pickup order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkforceController.prototype, "cancelPickup", null);
exports.WorkforceController = WorkforceController = __decorate([
    (0, swagger_1.ApiTags)('Workforce Mobile App'),
    (0, common_1.Controller)('workforce'),
    __metadata("design:paramtypes", [workforce_service_1.WorkforceService])
], WorkforceController);
//# sourceMappingURL=workforce.controller.js.map