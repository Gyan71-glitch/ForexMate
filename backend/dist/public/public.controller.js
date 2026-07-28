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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const public_service_1 = require("./public.service");
const swagger_1 = require("@nestjs/swagger");
let PublicController = class PublicController {
    publicService;
    constructor(publicService) {
        this.publicService = publicService;
    }
    getRates() {
        return this.publicService.getLiveRates();
    }
    getCurrencies() {
        return this.publicService.getActiveCurrencies();
    }
    getBranches() {
        return this.publicService.getActiveBranches();
    }
    getTestimonials() {
        return this.publicService.getTestimonials();
    }
    getRemittancePurposes() {
        return this.publicService.getRemittancePurposes();
    }
    getRemittanceCountries() {
        return this.publicService.getRemittanceCountries();
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get live exchange rates for public storefront' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Live rates returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getRates", null);
__decorate([
    (0, common_1.Get)('currencies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active currencies for public storefront' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Currencies returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getCurrencies", null);
__decorate([
    (0, common_1.Get)('branches'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active branches for public storefront' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Branches returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getBranches", null);
__decorate([
    (0, common_1.Get)('testimonials'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active testimonials for public storefront' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Testimonials returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getTestimonials", null);
__decorate([
    (0, common_1.Get)('remittance-purposes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active transfer purposes for public remittance form' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transfer purposes returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getRemittancePurposes", null);
__decorate([
    (0, common_1.Get)('remittance-countries'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active destination countries for public remittance form' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Destination countries returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getRemittanceCountries", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)('Public Website API'),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map