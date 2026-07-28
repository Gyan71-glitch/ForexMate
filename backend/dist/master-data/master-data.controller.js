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
exports.MasterDataController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const master_data_service_1 = require("./master-data.service");
const master_data_dto_1 = require("./dto/master-data.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let MasterDataController = class MasterDataController {
    masterDataService;
    constructor(masterDataService) {
        this.masterDataService = masterDataService;
    }
    async getMasterData() {
        return this.masterDataService.getAggregatedMasterData();
    }
    addBranch(dto) {
        return this.masterDataService.addBranch(dto);
    }
    addCurrency(dto) {
        return this.masterDataService.addCurrency(dto);
    }
};
exports.MasterDataController = MasterDataController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active master data (Currencies, Countries, Branches, etc.)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Master data retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getMasterData", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('masterdata:manage:all'),
    (0, common_1.Post)('branches'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new Branch (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Branch added' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [master_data_dto_1.CreateBranchDto]),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "addBranch", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('masterdata:manage:all'),
    (0, common_1.Post)('currencies'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new Currency (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Currency added' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [master_data_dto_1.CreateCurrencyDto]),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "addCurrency", null);
exports.MasterDataController = MasterDataController = __decorate([
    (0, swagger_1.ApiTags)('Master Data'),
    (0, common_1.Controller)('master-data'),
    __metadata("design:paramtypes", [master_data_service_1.MasterDataService])
], MasterDataController);
//# sourceMappingURL=master-data.controller.js.map