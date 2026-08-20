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
exports.TransactionEngineController = void 0;
const common_1 = require("@nestjs/common");
const transaction_engine_service_1 = require("./transaction-engine.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/optional-jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let TransactionEngineController = class TransactionEngineController {
    engineService;
    constructor(engineService) {
        this.engineService = engineService;
    }
    createSession(req) {
        const userId = req.user?.id || null;
        return this.engineService.createSession(userId);
    }
    updateDraft(req, id, draftState) {
        return this.engineService.updateDraftState(id, draftState, req.user?.id);
    }
    getWorkflowNextStep(req, id) {
        return this.engineService.getWorkflowNextStep(id, req.user?.id);
    }
    generateAndLockQuote(id, dto) {
        return this.engineService.generateAndLockQuote(id, dto);
    }
    checkout(id, body) {
        return this.engineService.checkout(id, body.idempotencyKey);
    }
    getSessionOrder(sessionId) {
        return this.engineService.getSessionOrder(sessionId);
    }
};
exports.TransactionEngineController = TransactionEngineController;
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('session'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize a new transaction session (Draft)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Session created' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TransactionEngineController.prototype, "createSession", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Put)('session/:id/draft'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Draft State' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Draft updated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TransactionEngineController.prototype, "updateDraft", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('session/:id/workflow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get next allowed steps from Workflow Engine' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow state returned' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TransactionEngineController.prototype, "getWorkflowNextStep", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('session/:id/quote'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate and lock a quote for this session' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransactionEngineController.prototype, "generateAndLockQuote", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('session/:id/checkout'),
    (0, swagger_1.ApiOperation)({ summary: 'Checkout and convert session to order (Idempotent)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransactionEngineController.prototype, "checkout", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('session/:id/order'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order associated with session' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionEngineController.prototype, "getSessionOrder", null);
exports.TransactionEngineController = TransactionEngineController = __decorate([
    (0, swagger_1.ApiTags)('Transaction Engine (V2)'),
    (0, common_1.Controller)('transaction-engine'),
    __metadata("design:paramtypes", [transaction_engine_service_1.TransactionEngineService])
], TransactionEngineController);
//# sourceMappingURL=transaction-engine.controller.js.map