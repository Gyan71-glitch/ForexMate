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
exports.ReceiveBranchInventoryDto = exports.ManagerCompletePickupDto = exports.AssignDeliveryPartnerDto = exports.ReassignBranchDto = exports.CompleteCashSellDto = exports.CompleteDeliveryDto = exports.VerifyCustomerOtpDto = exports.SendCustomerOtpDto = exports.WorkforceChangePasswordDto = exports.WorkforceLoginDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class WorkforceLoginDto {
    employeeCode;
    password;
}
exports.WorkforceLoginDto = WorkforceLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP-000001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WorkforceLoginDto.prototype, "employeeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Temp@1234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WorkforceLoginDto.prototype, "password", void 0);
class WorkforceChangePasswordDto {
    currentPassword;
    newPassword;
    confirmPassword;
}
exports.WorkforceChangePasswordDto = WorkforceChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WorkforceChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], WorkforceChangePasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WorkforceChangePasswordDto.prototype, "confirmPassword", void 0);
class SendCustomerOtpDto {
    recipient;
}
exports.SendCustomerOtpDto = SendCustomerOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210', description: 'Customer phone or email' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendCustomerOtpDto.prototype, "recipient", void 0);
class VerifyCustomerOtpDto {
    recipient;
    code;
}
exports.VerifyCustomerOtpDto = VerifyCustomerOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyCustomerOtpDto.prototype, "recipient", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyCustomerOtpDto.prototype, "code", void 0);
class CompleteDeliveryDto {
    signatureData;
    photoData;
    otpVerified;
}
exports.CompleteDeliveryDto = CompleteDeliveryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base64 encoded customer signature' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteDeliveryDto.prototype, "signatureData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base64 encoded delivery photo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteDeliveryDto.prototype, "photoData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer OTP verified' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CompleteDeliveryDto.prototype, "otpVerified", void 0);
class CompleteCashSellDto {
    notes;
}
exports.CompleteCashSellDto = CompleteCashSellDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Confirm INR received from customer' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompleteCashSellDto.prototype, "notes", void 0);
class ReassignBranchDto {
    targetBranchId;
    reason;
}
exports.ReassignBranchDto = ReassignBranchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target branch ID inside the same city' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReassignBranchDto.prototype, "targetBranchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for reassigning order' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReassignBranchDto.prototype, "reason", void 0);
class AssignDeliveryPartnerDto {
    deliveryPartnerId;
}
exports.AssignDeliveryPartnerDto = AssignDeliveryPartnerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery partner employee ID or ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AssignDeliveryPartnerDto.prototype, "deliveryPartnerId", void 0);
class ManagerCompletePickupDto {
    otp;
    photoUrl;
    remarks;
}
exports.ManagerCompletePickupDto = ManagerCompletePickupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Verified customer OTP' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ManagerCompletePickupDto.prototype, "otp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer photo with received cash' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ManagerCompletePickupDto.prototype, "photoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Manager handover remarks' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ManagerCompletePickupDto.prototype, "remarks", void 0);
class ReceiveBranchInventoryDto {
    currencyCode;
    amount;
    sourceType;
    referenceNumber;
    receivedDate;
    notes;
    treasurySlipPhotoUrl;
    currencyBundlePhotoUrl;
    vaultShelfPhotoUrl;
}
exports.ReceiveBranchInventoryDto = ReceiveBranchInventoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReceiveBranchInventoryDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ReceiveBranchInventoryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HQ_TREASURY_TRANSFER' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReceiveBranchInventoryDto.prototype, "sourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TRE-2026-000234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReceiveBranchInventoryDto.prototype, "referenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-22' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveBranchInventoryDto.prototype, "receivedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Stock replenishment for Indiranagar Branch Vault' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveBranchInventoryDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base64/URL photo of Treasury Slip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveBranchInventoryDto.prototype, "treasurySlipPhotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base64/URL photo of Currency Bundle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveBranchInventoryDto.prototype, "currencyBundlePhotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base64/URL photo of Vault Shelf' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveBranchInventoryDto.prototype, "vaultShelfPhotoUrl", void 0);
//# sourceMappingURL=workforce.dto.js.map