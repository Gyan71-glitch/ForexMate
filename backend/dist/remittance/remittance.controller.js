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
exports.RemittanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const remittance_service_1 = require("./remittance.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/optional-jwt-auth.guard");
let RemittanceController = class RemittanceController {
    remittanceService;
    constructor(remittanceService) {
        this.remittanceService = remittanceService;
    }
    getPurposes() {
        return this.remittanceService.getPurposes();
    }
    getCountries() {
        return this.remittanceService.getCountries();
    }
    getPartners() {
        return this.remittanceService.getPartners();
    }
    calculate(req, amount, currency, countryCode, purposeCode, direction) {
        return this.remittanceService.calculate(req.user?.id, {
            amount: parseFloat(amount),
            currency,
            countryCode,
            purposeCode,
            direction
        });
    }
    getMyRemittances(req) {
        return this.remittanceService.getMyRemittances(req.user.id);
    }
    getAllMyRemittances(req) {
        return this.remittanceService.getMyRemittances(req.user.id);
    }
    getBeneficiaries(req) {
        return this.remittanceService.getBeneficiaries(req.user.id);
    }
    createBeneficiary(req, body) {
        return this.remittanceService.createBeneficiary(req.user.id, body);
    }
    deleteBeneficiary(req, id) {
        return this.remittanceService.deleteBeneficiary(req.user.id, id);
    }
    getRemittanceById(id, req) {
        return this.remittanceService.getRemittanceById(id, req.user.id);
    }
};
exports.RemittanceController = RemittanceController;
__decorate([
    (0, common_1.Get)('purposes'),
    (0, swagger_1.ApiOperation)({ summary: 'List active transfer purposes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "getPurposes", null);
__decorate([
    (0, common_1.Get)('countries'),
    (0, swagger_1.ApiOperation)({ summary: 'List active destination countries' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "getCountries", null);
__decorate([
    (0, common_1.Get)('partners'),
    (0, swagger_1.ApiOperation)({ summary: 'List active remittance partners' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "getPartners", null);
__decorate([
    (0, common_1.Get)('calculate'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate remittance total, fees, and TCS tax' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('amount')),
    __param(2, (0, common_1.Query)('currency')),
    __param(3, (0, common_1.Query)('countryCode')),
    __param(4, (0, common_1.Query)('purposeCode')),
    __param(5, (0, common_1.Query)('direction')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)('my-orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all remittance orders for the logged-in user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "getMyRemittances", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all remittance orders for the logged-in user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "getAllMyRemittances", null);
__decorate([
    (0, common_1.Get)('beneficiaries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer\'s saved beneficiaries' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "getBeneficiaries", null);
__decorate([
    (0, common_1.Post)('beneficiaries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Save a new beneficiary' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "createBeneficiary", null);
__decorate([
    (0, common_1.Delete)('beneficiaries/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a beneficiary' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "deleteBeneficiary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific remittance order by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RemittanceController.prototype, "getRemittanceById", null);
exports.RemittanceController = RemittanceController = __decorate([
    (0, swagger_1.ApiTags)('Remittance'),
    (0, common_1.Controller)('remittances'),
    __metadata("design:paramtypes", [remittance_service_1.RemittanceService])
], RemittanceController);
//# sourceMappingURL=remittance.controller.js.map