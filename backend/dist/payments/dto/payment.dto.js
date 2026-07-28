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
exports.ConfirmPaymentDto = exports.InitializePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InitializePaymentDto {
    orderId;
    providerId;
}
exports.InitializePaymentDto = InitializePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order-uuid', description: 'The Order ID to pay for' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitializePaymentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'provider-uuid', description: 'The Payment Provider ID (e.g., Razorpay, BillDesk)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitializePaymentDto.prototype, "providerId", void 0);
class ConfirmPaymentDto {
    gatewayTxnId;
    razorpayOrderId;
    razorpaySignature;
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pay_ABC123', description: 'Transaction ID from the payment gateway' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "gatewayTxnId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "razorpaySignature", void 0);
//# sourceMappingURL=payment.dto.js.map