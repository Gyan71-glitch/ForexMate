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
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const sync_service_1 = require("./sync.service");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const swagger_1 = require("@nestjs/swagger");
let SyncController = class SyncController {
    syncService;
    constructor(syncService) {
        this.syncService = syncService;
    }
    sendEvents(req) {
        const user = req.user;
        return this.syncService.getSyncStream().pipe((0, operators_1.filter)((msg) => {
            const payload = msg.data?.payload;
            if (!payload)
                return true;
            const eventUserId = payload.userId || payload.user?.id || payload.profile?.userId;
            const eventBranchId = payload.branchId || payload.order?.branchId;
            if (user.role === 'CUSTOMER') {
                return eventUserId === user.id;
            }
            if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPERATIONS_ADMIN') {
                if (eventBranchId) {
                    return eventBranchId === user.branchId;
                }
            }
            return true;
        }));
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Sse)('events'),
    (0, swagger_1.ApiOperation)({ summary: 'Real-time server-sent events stream for portal synchronization' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], SyncController.prototype, "sendEvents", null);
exports.SyncController = SyncController = __decorate([
    (0, swagger_1.ApiTags)('Real-time Sync'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sync'),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncController);
//# sourceMappingURL=sync.controller.js.map