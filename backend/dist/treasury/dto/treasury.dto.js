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
exports.InterbankTradeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InterbankTradeDto {
    currencyCode;
    tradeType;
    amount;
    rate;
    bankName;
}
exports.InterbankTradeDto = InterbankTradeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'Currency code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InterbankTradeDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BUY', description: 'Trade type (BUY or SELL)' }),
    (0, class_validator_1.IsEnum)(['BUY', 'SELL']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InterbankTradeDto.prototype, "tradeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10000, description: 'Amount traded' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InterbankTradeDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 83.50, description: 'Exchange rate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InterbankTradeDto.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HDFC Bank', description: 'Counterparty bank' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InterbankTradeDto.prototype, "bankName", void 0);
//# sourceMappingURL=treasury.dto.js.map