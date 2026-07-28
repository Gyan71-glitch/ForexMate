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
exports.ForexCardController = void 0;
const common_1 = require("@nestjs/common");
const forex_card_service_1 = require("./forex-card.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ForexCardController = class ForexCardController {
    forexCardService;
    constructor(forexCardService) {
        this.forexCardService = forexCardService;
    }
    applyForCard(userId, data, req) {
        if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
            throw new common_1.ForbiddenException('You can only apply for your own card.');
        }
        return this.forexCardService.applyForCard(userId, data.currencyId, data.balance);
    }
    getUserCards(userId, req) {
        if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
            throw new common_1.ForbiddenException('You can only view your own cards.');
        }
        return this.forexCardService.getUserCards(userId);
    }
    getMyCards(req) {
        return this.forexCardService.getUserCards(req.user.id);
    }
    getMyTransactions(req) {
        return this.forexCardService.getAllTransactions(req.user.id);
    }
    getCardById(id, req) {
        return this.forexCardService.getCardById(id, req.user.id);
    }
    freezeCard(id, req) {
        return this.forexCardService.freezeCard(id, req.user.id);
    }
    unfreezeCard(id, req) {
        return this.forexCardService.unfreezeCard(id, req.user.id);
    }
    reloadCard(id, data, req) {
        return this.forexCardService.reloadCard(id, req.user.id, data.currencyId, data.amount);
    }
};
exports.ForexCardController = ForexCardController;
__decorate([
    (0, common_1.Post)('apply/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply for a Forex Card' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Card application successful' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { currencyId: { type: 'string' }, balance: { type: 'number' } } } }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ForexCardController.prototype, "applyForCard", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Forex Cards for a specific user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ForexCardController.prototype, "getUserCards", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Forex Cards for the logged-in user (with wallets & recent txns)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ForexCardController.prototype, "getMyCards", null);
__decorate([
    (0, common_1.Get)('mine/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all card transactions for the logged-in user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ForexCardController.prototype, "getMyTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a specific card' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ForexCardController.prototype, "getCardById", null);
__decorate([
    (0, common_1.Patch)(':id/freeze'),
    (0, swagger_1.ApiOperation)({ summary: 'Freeze a card' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ForexCardController.prototype, "freezeCard", null);
__decorate([
    (0, common_1.Patch)(':id/unfreeze'),
    (0, swagger_1.ApiOperation)({ summary: 'Unfreeze a card' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ForexCardController.prototype, "unfreezeCard", null);
__decorate([
    (0, common_1.Post)(':id/reload'),
    (0, swagger_1.ApiOperation)({ summary: 'Reload a card wallet' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { currencyId: { type: 'string' }, amount: { type: 'number' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ForexCardController.prototype, "reloadCard", null);
exports.ForexCardController = ForexCardController = __decorate([
    (0, swagger_1.ApiTags)('Forex Cards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('forex-cards'),
    __metadata("design:paramtypes", [forex_card_service_1.ForexCardService])
], ForexCardController);
//# sourceMappingURL=forex-card.controller.js.map