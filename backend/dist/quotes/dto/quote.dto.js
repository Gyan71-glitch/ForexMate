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
exports.GenerateQuoteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GenerateQuoteDto {
    currency;
    product;
    amount;
    branchId;
    sessionId;
}
exports.GenerateQuoteDto = GenerateQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'The currency code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateQuoteDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CASH', description: 'Product type (CASH, CARD, REMITTANCE)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateQuoteDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000, description: 'Amount in foreign currency' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], GenerateQuoteDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch-uuid', description: 'The branch ID where order will be fulfilled' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateQuoteDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'session-uuid', description: 'Transaction session id', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateQuoteDto.prototype, "sessionId", void 0);
//# sourceMappingURL=quote.dto.js.map