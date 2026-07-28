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
exports.CashAllocationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cash_allocation_service_1 = require("./cash-allocation.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CashAllocationController = class CashAllocationController {
    cashAllocationService;
    constructor(cashAllocationService) {
        this.cashAllocationService = cashAllocationService;
    }
    create(body, req) {
        const userId = req.user.id;
        const role = req.user.role;
        return this.cashAllocationService.createAllocation(userId, role, body.orderId, body.items);
    }
    findOne(orderId) {
        return this.cashAllocationService.getAllocation(orderId);
    }
};
exports.CashAllocationController = CashAllocationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit denomination allocation for customer cash buy order' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cash allocation locked and reserved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Incorrect allocation amounts or insufficient note counts' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CashAllocationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':orderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash allocation details for an order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cash allocation details retrieved' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CashAllocationController.prototype, "findOne", null);
exports.CashAllocationController = CashAllocationController = __decorate([
    (0, swagger_1.ApiTags)('Cash Allocation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ops/cash-allocation'),
    __metadata("design:paramtypes", [cash_allocation_service_1.CashAllocationService])
], CashAllocationController);
//# sourceMappingURL=cash-allocation.controller.js.map