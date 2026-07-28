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
exports.DevSystemService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DevSystemService = class DevSystemService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSystemHealth() {
        const errorFlags = global.devErrorFlags || {};
        let dbStatus = 'ONLINE';
        try {
            await this.prisma.user.findFirst();
        }
        catch (err) {
            dbStatus = 'OFFLINE';
        }
        return {
            backend: 'ONLINE',
            database: dbStatus,
            redis: errorFlags.REDIS_DOWN ? 'OFFLINE' : 'CONNECTED',
            fastforex: errorFlags.FASTFOREX_TIMEOUT || errorFlags.FASTFOREX_OFFLINE ? 'OFFLINE' : 'HEALTHY',
            razorpay: errorFlags.PAYMENT_GATEWAY_FAILURE ? 'OFFLINE' : 'HEALTHY',
            queue: errorFlags.QUEUE_FAILURE ? 'OFFLINE' : 'RUNNING',
            storage: errorFlags.STORAGE_FAILURE ? 'OFFLINE' : 'CONNECTED',
            cronJobs: 'RUNNING',
            mail: errorFlags.SMTP_FAILURE ? 'OFFLINE' : 'READY',
            sms: errorFlags.SMS_FAILURE ? 'OFFLINE' : 'READY',
        };
    }
    async getPerformanceMetrics() {
        const mem = process.memoryUsage();
        const cpu = process.cpuUsage();
        const pendingNotifications = await this.prisma.notificationQueue.count({
            where: { status: 'PENDING' }
        });
        const failedNotifications = await this.prisma.notificationQueue.count({
            where: { status: 'FAILED' }
        });
        const activeDbConnections = Math.floor(3 + Math.random() * 5);
        return {
            cpuUsageUser: `${(cpu.user / 1000000).toFixed(2)}s`,
            cpuUsageSystem: `${(cpu.system / 1000000).toFixed(2)}s`,
            heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
            external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
            activeDbConnections,
            queueDepth: pendingNotifications,
            deadLetterQueue: failedNotifications,
            cacheHitRate: '94.2%',
            eventThroughput: '12 events/sec',
        };
    }
    async injectError(flagName, state) {
        if (!global.devErrorFlags) {
            global.devErrorFlags = {};
        }
        global.devErrorFlags[flagName] = state;
        return { success: true, flags: global.devErrorFlags };
    }
    async getInjectedErrors() {
        return global.devErrorFlags || {};
    }
    async setFeatureFlag(flagName, state) {
        if (!global.devFeatureFlags) {
            global.devFeatureFlags = {};
        }
        global.devFeatureFlags[flagName] = state;
        return { success: true, flags: global.devFeatureFlags };
    }
    async getFeatureFlags() {
        const defaults = {
            Authentication: { MFA: true, GoogleOAuth: true },
            Orders: { CashCollection: true, HomeDelivery: true },
            Payments: { Razorpay: true, BillDesk: false },
            Cards: { ReloadCard: true, RefundCard: true },
            Compliance: { AMLCheck: true, LRSCheck: true },
            Notifications: { EmailAlerts: true, SmsAlerts: true, WhatsappAlerts: false },
            Experimental: { CryptoPayouts: false, TravelHub: false }
        };
        const overrides = global.devFeatureFlags || {};
        const result = {};
        for (const [group, flags] of Object.entries(defaults)) {
            result[group] = {};
            for (const [flag, defVal] of Object.entries(flags)) {
                result[group][flag] = overrides[flag] !== undefined ? overrides[flag] : defVal;
            }
        }
        return result;
    }
    async setMockTime(dateStr) {
        if (dateStr) {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) {
                throw new common_1.BadRequestException('Invalid date string format.');
            }
            global.devMockTime = d.toISOString();
        }
        else {
            global.devMockTime = null;
        }
        return { success: true, mockTime: global.devMockTime };
    }
    async getMockTime() {
        return { mockTime: global.devMockTime || null };
    }
    async getQueueData() {
        const counts = {
            PENDING: await this.prisma.notificationQueue.count({ where: { status: 'PENDING' } }),
            FAILED: await this.prisma.notificationQueue.count({ where: { status: 'FAILED' } }),
            PROCESSED: await this.prisma.notificationQueue.count({ where: { status: 'PROCESSED' } }),
        };
        const recent = await this.prisma.notificationQueue.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
        });
        return { counts, recent, isPaused: global.devQueuePaused || false };
    }
    async executeQueueAction(action) {
        switch (action) {
            case 'RETRY_FAILED':
                await this.prisma.notificationQueue.updateMany({
                    where: { status: 'FAILED' },
                    data: { status: 'PENDING', attempts: 0 },
                });
                break;
            case 'PAUSE':
                global.devQueuePaused = true;
                break;
            case 'RESUME':
                global.devQueuePaused = false;
                break;
            case 'CLEAR_DLQ':
                await this.prisma.notificationQueue.deleteMany({
                    where: { status: 'FAILED' },
                });
                break;
            case 'REPROCESS_EMAILS':
                await this.prisma.notificationQueue.updateMany({
                    where: { status: 'FAILED', channel: 'EMAIL' },
                    data: { status: 'PENDING', attempts: 0 },
                });
                break;
            default:
                throw new common_1.BadRequestException(`Unknown queue action: ${action}`);
        }
        return { success: true, action };
    }
    async getTableRows(table) {
        const allowedTables = [
            'user',
            'customerProfile',
            'order',
            'payment',
            'forexCard',
            'supportTicket',
            'branch',
            'currency',
            'auditLog',
            'invoice'
        ];
        if (!allowedTables.includes(table)) {
            throw new common_1.BadRequestException(`Table ${table} access not allowed.`);
        }
        const clientTable = this.prisma[table];
        if (!clientTable) {
            throw new common_1.BadRequestException(`Prisma model ${table} not found.`);
        }
        return clientTable.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.DevSystemService = DevSystemService;
exports.DevSystemService = DevSystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevSystemService);
//# sourceMappingURL=dev-system.service.js.map