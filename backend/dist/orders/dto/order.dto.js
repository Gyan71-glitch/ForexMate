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
exports.UpdateOrderStatusDto = exports.CreateOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateOrderDto {
    quoteId;
    branchId;
    deliveryMethod;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'quote-uuid', description: 'The generated quote ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "quoteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch-uuid', description: 'The branch ID where order will be fulfilled' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STORE_PICKUP', description: 'Delivery method (STORE_PICKUP, HOME_DELIVERY)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "deliveryMethod", void 0);
class UpdateOrderStatusDto {
    status;
}
exports.UpdateOrderStatusDto = UpdateOrderStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PROCESSING', description: 'New order status' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "status", void 0);
//# sourceMappingURL=order.dto.js.map