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
exports.AccountingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const accounting_service_1 = require("./accounting.service");
const accounting_dto_1 = require("./dto/accounting.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let AccountingController = class AccountingController {
    accountingService;
    constructor(accountingService) {
        this.accountingService = accountingService;
    }
    createLedger(dto) {
        return this.accountingService.createLedger(dto);
    }
    getLedgers() {
        return this.accountingService.getLedgers();
    }
    createJournalEntry(dto) {
        return this.accountingService.createJournalEntry(dto);
    }
    getJournals() {
        return this.accountingService.getJournals();
    }
};
exports.AccountingController = AccountingController;
__decorate([
    (0, permissions_decorator_1.Permissions)('accounting:manage:all'),
    (0, common_1.Post)('ledgers'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new General Ledger account (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ledger created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.CreateLedgerDto]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createLedger", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('accounting:read:all'),
    (0, common_1.Get)('ledgers'),
    (0, swagger_1.ApiOperation)({ summary: 'List all General Ledgers (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ledgers retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getLedgers", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('accounting:manage:all'),
    (0, common_1.Post)('journals'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Journal Entry (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Journal Entry created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.CreateJournalEntryDto]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createJournalEntry", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('accounting:read:all'),
    (0, common_1.Get)('journals'),
    (0, swagger_1.ApiOperation)({ summary: 'List all Journal Entries (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Journal Entries retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getJournals", null);
exports.AccountingController = AccountingController = __decorate([
    (0, swagger_1.ApiTags)('Accounting'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('accounting'),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService])
], AccountingController);
//# sourceMappingURL=accounting.controller.js.map