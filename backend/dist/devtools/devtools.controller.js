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
exports.DevToolsController = void 0;
const common_1 = require("@nestjs/common");
const devtools_guard_1 = require("./devtools.guard");
const dev_auth_service_1 = require("./services/dev-auth.service");
const dev_kyc_service_1 = require("./services/dev-kyc.service");
const dev_payment_service_1 = require("./services/dev-payment.service");
const dev_seed_service_1 = require("./services/dev-seed.service");
const dev_rate_service_1 = require("./services/dev-rate.service");
const dev_events_service_1 = require("./services/dev-events.service");
const dev_system_service_1 = require("./services/dev-system.service");
const prisma_service_1 = require("../prisma/prisma.service");
const integrity_checker_service_1 = require("../common/services/integrity-checker.service");
let DevToolsController = class DevToolsController {
    prisma;
    devAuthService;
    devKycService;
    devPaymentService;
    devSeedService;
    devRateService;
    devEventsService;
    devSystemService;
    integrityService;
    constructor(prisma, devAuthService, devKycService, devPaymentService, devSeedService, devRateService, devEventsService, devSystemService, integrityService) {
        this.prisma = prisma;
        this.devAuthService = devAuthService;
        this.devKycService = devKycService;
        this.devPaymentService = devPaymentService;
        this.devSeedService = devSeedService;
        this.devRateService = devRateService;
        this.devEventsService = devEventsService;
        this.devSystemService = devSystemService;
        this.integrityService = integrityService;
    }
    async quickLogin(role) {
        const email = role === 'admin' ? 'admin@forexmate.com' : 'customer@forexmate.com';
        const roleOverride = role === 'admin' ? 'SUPER_ADMIN' : 'CUSTOMER';
        const result = await this.devAuthService.generateImpersonationToken(email, roleOverride);
        this.devEventsService.emit('DevQuickLogin', { role, email });
        return result;
    }
    async impersonate(body) {
        const result = await this.devAuthService.generateImpersonationToken(body.email, body.role);
        this.devEventsService.emit('DevImpersonation', { email: body.email, role: body.role });
        return result;
    }
    async getUsersList() {
        return this.devAuthService.getSessions();
    }
    async applyKycPreset(body) {
        const result = await this.devKycService.applyKycPreset(body.userId, body.preset);
        this.devEventsService.emit('KycPresetApplied', { userId: body.userId, preset: body.preset });
        return result;
    }
    async uploadMockKycDocument(body) {
        const { userId, ...options } = body;
        const result = await this.devKycService.seedMockDocument(userId, options);
        this.devEventsService.emit('KycMockDocumentUploaded', { userId, docType: options.docType });
        return result;
    }
    async mockPayOrder(orderId, body) {
        const result = await this.devPaymentService.mockPayOrder(orderId, body.scenario);
        this.devEventsService.emit('PaymentScenarioTriggered', { orderId, scenario: body.scenario });
        return result;
    }
    async seedPreset(body) {
        const result = await this.devSeedService.seedProfile(body.presetName);
        this.devEventsService.emit('DbSeedPresetApplied', { presetName: body.presetName });
        return result;
    }
    async resetDatabase(body) {
        const result = await this.devSeedService.factoryReset(body.confirmation);
        this.devEventsService.emit('DbFactoryReset', { confirmation: body.confirmation });
        return result;
    }
    async setRateMode(body) {
        const result = await this.devRateService.setRateMode(body.action);
        this.devEventsService.emit('RatesOverrideChanged', { action: body.action });
        return result;
    }
    async getRatesMode() {
        return this.devRateService.getRateMode();
    }
    async getEvents(filter, search) {
        return this.devEventsService.getEvents(filter, search);
    }
    async replayEvent(eventId) {
        const result = await this.devEventsService.replayEvent(eventId);
        this.devEventsService.emit('EventReplayed', { replayedEventId: eventId });
        return result;
    }
    async clearEvents() {
        return this.devEventsService.clearEvents();
    }
    async getQueues() {
        return this.devSystemService.getQueueData();
    }
    async executeQueueAction(body) {
        const result = await this.devSystemService.executeQueueAction(body.action);
        this.devEventsService.emit('QueueActionExecuted', { action: body.action });
        return result;
    }
    async getPerformance() {
        return this.devSystemService.getPerformanceMetrics();
    }
    async getHealth() {
        return this.devSystemService.getSystemHealth();
    }
    async injectError(body) {
        const result = await this.devSystemService.injectError(body.flag, body.state);
        this.devEventsService.emit('ErrorInjected', { flag: body.flag, state: body.state });
        return result;
    }
    async getInjectedErrors() {
        return this.devSystemService.getInjectedErrors();
    }
    async setFeatureFlag(body) {
        const result = await this.devSystemService.setFeatureFlag(body.flag, body.state);
        this.devEventsService.emit('FeatureFlagOverridden', { flag: body.flag, state: body.state });
        return result;
    }
    async getFeatureFlags() {
        return this.devSystemService.getFeatureFlags();
    }
    async setMockTime(body) {
        const result = await this.devSystemService.setMockTime(body.date);
        this.devEventsService.emit('MockTimeOverridden', { date: body.date });
        return result;
    }
    async getMockTime() {
        return this.devSystemService.getMockTime();
    }
    async getTableRows(tableName) {
        return this.devSystemService.getTableRows(tableName);
    }
    async getSessionOrder(sessionId) {
        const order = await this.prisma.order.findFirst({
            where: { sessionId },
            include: { payments: true }
        });
        return order;
    }
    async logAction(body) {
        await this.prisma.auditLog.create({
            data: {
                action: 'DEV_ACTION',
                newData: { description: `DevTools Action: ${body.action}`, actor: body.email || 'Anonymous Dev' },
                ipAddress: '127.0.0.1'
            }
        });
        return { success: true };
    }
    async checkIntegrity() {
        return this.integrityService.runIntegrityChecks();
    }
};
exports.DevToolsController = DevToolsController;
__decorate([
    (0, common_1.Post)('login/:role'),
    __param(0, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "quickLogin", null);
__decorate([
    (0, common_1.Post)('impersonate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "impersonate", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getUsersList", null);
__decorate([
    (0, common_1.Post)('kyc-preset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "applyKycPreset", null);
__decorate([
    (0, common_1.Post)('kyc/upload-mock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "uploadMockKycDocument", null);
__decorate([
    (0, common_1.Post)('mock-pay-order/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "mockPayOrder", null);
__decorate([
    (0, common_1.Post)('seed-preset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "seedPreset", null);
__decorate([
    (0, common_1.Post)('reset-database'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "resetDatabase", null);
__decorate([
    (0, common_1.Post)('rate-control'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "setRateMode", null);
__decorate([
    (0, common_1.Get)('rates-mode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getRatesMode", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Post)('events/replay/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "replayEvent", null);
__decorate([
    (0, common_1.Post)('events/clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "clearEvents", null);
__decorate([
    (0, common_1.Get)('queues'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getQueues", null);
__decorate([
    (0, common_1.Post)('queues/action'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "executeQueueAction", null);
__decorate([
    (0, common_1.Get)('performance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getPerformance", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Post)('error-injection'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "injectError", null);
__decorate([
    (0, common_1.Get)('error-injection'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getInjectedErrors", null);
__decorate([
    (0, common_1.Post)('feature-flag'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "setFeatureFlag", null);
__decorate([
    (0, common_1.Get)('feature-flags'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getFeatureFlags", null);
__decorate([
    (0, common_1.Post)('mock-time'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "setMockTime", null);
__decorate([
    (0, common_1.Get)('mock-time'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getMockTime", null);
__decorate([
    (0, common_1.Get)('table/:tableName'),
    __param(0, (0, common_1.Param)('tableName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getTableRows", null);
__decorate([
    (0, common_1.Get)('session/:id/order'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "getSessionOrder", null);
__decorate([
    (0, common_1.Post)('log-action'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "logAction", null);
__decorate([
    (0, common_1.Get)('integrity-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevToolsController.prototype, "checkIntegrity", null);
exports.DevToolsController = DevToolsController = __decorate([
    (0, common_1.UseGuards)(devtools_guard_1.DevToolsGuard),
    (0, common_1.Controller)('dev'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        dev_auth_service_1.DevAuthService,
        dev_kyc_service_1.DevKycService,
        dev_payment_service_1.DevPaymentService,
        dev_seed_service_1.DevSeedService,
        dev_rate_service_1.DevRateService,
        dev_events_service_1.DevEventsService,
        dev_system_service_1.DevSystemService,
        integrity_checker_service_1.IntegrityCheckerService])
], DevToolsController);
//# sourceMappingURL=devtools.controller.js.map