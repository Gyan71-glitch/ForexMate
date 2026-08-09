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
exports.CreateLedgerDto = exports.CreateJournalEntryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateJournalEntryDto {
    ledgerId;
    type;
    amount;
    description;
}
exports.CreateJournalEntryDto = CreateJournalEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ledger-uuid', description: 'General Ledger ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "ledgerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CREDIT', description: 'Entry type (DEBIT or CREDIT)' }),
    (0, class_validator_1.IsEnum)(['DEBIT', 'CREDIT']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000.0, description: 'Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateJournalEntryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Customer Payment Received', description: 'Description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "description", void 0);
class CreateLedgerDto {
    accountName;
}
exports.CreateLedgerDto = CreateLedgerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Operating Account', description: 'Name of the ledger account' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLedgerDto.prototype, "accountName", void 0);
//# sourceMappingURL=accounting.dto.js.map