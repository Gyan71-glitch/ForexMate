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
exports.RatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rates_service_1 = require("./rates.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let RatesController = class RatesController {
    ratesService;
    constructor(ratesService) {
        this.ratesService = ratesService;
    }
    async getAllRates() {
        return this.ratesService.getAllRates();
    }
    async updateRate(id, body) {
        return this.ratesService.updateRate(id, Number(body.inrRate), Number(body.marginBuyPct), Number(body.marginSellPct));
    }
    async getProducts() {
        return this.ratesService.getProducts();
    }
    async updateProduct(id, body) {
        return this.ratesService.updateProduct(id, body.isActive);
    }
};
exports.RatesController = RatesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get live conversion rates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rates retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RatesController.prototype, "getAllRates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('rates.manage'),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update exchange rate margins manually' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RatesController.prototype, "updateRate", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RatesController.prototype, "getProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('rates.manage'),
    (0, common_1.Patch)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RatesController.prototype, "updateProduct", null);
exports.RatesController = RatesController = __decorate([
    (0, swagger_1.ApiTags)('Rates'),
    (0, common_1.Controller)('rates'),
    __metadata("design:paramtypes", [rates_service_1.RatesService])
], RatesController);
//# sourceMappingURL=rates.controller.js.map