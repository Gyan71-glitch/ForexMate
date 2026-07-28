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
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const compliance_service_1 = require("./compliance.service");
const compliance_dto_1 = require("./dto/compliance.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let ComplianceController = class ComplianceController {
    complianceService;
    constructor(complianceService) {
        this.complianceService = complianceService;
    }
    getKycRules(req) {
        const { product, purpose } = req.query;
        return this.complianceService.getKycRules(product, purpose);
    }
    getMyKycDocuments(req) {
        return this.complianceService.getMyKycDocuments(req.user.id);
    }
    getKycEligibility(req) {
        return this.complianceService.evaluateCashBuyKycEligibility(req.user.id);
    }
    uploadKycDocument(req, docType, knownDocNumber, knownDob, knownName, knownExpiryDate, file) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        if (!docType) {
            throw new common_1.BadRequestException('docType is required');
        }
        return this.complianceService.uploadKycDocument(req.user.id, docType, file.path, undefined, knownDocNumber || undefined, knownDob || undefined, knownName || undefined, knownExpiryDate || undefined);
    }
    deleteKycDocument(id, req) {
        return this.complianceService.deleteKycDocument(req.user.id, id);
    }
    submitKyc(req) {
        return this.complianceService.submitKyc(req.user.id);
    }
    getPendingKyc() {
        return this.complianceService.getPendingKyc();
    }
    reviewKyc(docId, dto, req) {
        return this.complianceService.reviewKyc(docId, dto, req.user.id);
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dynamic KYC rules based on product and purpose' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getKycRules", null);
__decorate([
    (0, common_1.Get)('kyc/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all KYC documents and status for the logged-in user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getMyKycDocuments", null);
__decorate([
    (0, common_1.Get)('kyc/eligibility'),
    (0, swagger_1.ApiOperation)({ summary: 'Evaluate customer KYC eligibility for Cash Buy' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getKycEligibility", null);
__decorate([
    (0, common_1.Post)('kyc/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a new KYC document' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'The KYC document image (PNG/JPG)' },
                docType: { type: 'string', example: 'PAN', description: 'Document type (e.g., PAN, PASSPORT)' },
                knownDocNumber: { type: 'string', example: 'CQDPV9729A', description: 'Optional: document number already known (helps OCR fallback)' },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('docType')),
    __param(2, (0, common_1.Body)('knownDocNumber')),
    __param(3, (0, common_1.Body)('knownDob')),
    __param(4, (0, common_1.Body)('knownName')),
    __param(5, (0, common_1.Body)('knownExpiryDate')),
    __param(6, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "uploadKycDocument", null);
__decorate([
    (0, common_1.Delete)('kyc/documents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a pending KYC document before submission' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "deleteKycDocument", null);
__decorate([
    (0, common_1.Post)('kyc/submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit all pending documents for compliance review' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "submitKyc", null);
__decorate([
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('kyc:review:all'),
    (0, common_1.Get)('kyc-pending'),
    (0, swagger_1.ApiOperation)({ summary: 'List all pending KYC documents (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pending KYC documents retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getPendingKyc", null);
__decorate([
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('kyc:review:all'),
    (0, common_1.Post)('kyc/:id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or Reject a KYC document (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC reviewed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, compliance_dto_1.ReviewKycDto, Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "reviewKyc", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, swagger_1.ApiTags)('Compliance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('compliance'),
    __metadata("design:paramtypes", [compliance_service_1.ComplianceService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map