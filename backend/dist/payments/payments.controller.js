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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const payment_dto_1 = require("./dto/payment.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    getProviders() {
        return this.paymentsService.getProviders();
    }
    initialize(dto, req) {
        return this.paymentsService.initializePayment(req.user.id, dto);
    }
    confirm(paymentId, dto) {
        return this.paymentsService.confirmPayment(paymentId, dto);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('providers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active payment providers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active payment providers retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getProviders", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('initialize'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize a new payment for an order' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment initialized successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Order not found or invalid' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.InitializePaymentDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "initialize", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a payment with the gateway transaction ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payment_dto_1.ConfirmPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "confirm", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map