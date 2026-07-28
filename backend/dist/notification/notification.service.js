"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const nodemailer = __importStar(require("nodemailer"));
const twilio_1 = require("twilio");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    logger = new common_1.Logger(NotificationService_1.name);
    lastActiveUsers = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    markUserActive(userId) {
        this.lastActiveUsers.set(userId, Date.now());
    }
    isUserOnline(userId) {
        const lastActive = this.lastActiveUsers.get(userId);
        if (!lastActive)
            return false;
        return Date.now() - lastActive < 15000;
    }
    getOnlineUserIds() {
        const now = Date.now();
        const online = [];
        for (const [userId, lastActive] of this.lastActiveUsers.entries()) {
            if (now - lastActive < 15000) {
                online.push(userId);
            }
        }
        return online;
    }
    async getInAppNotifications(userId) {
        this.markUserActive(userId);
        return this.prisma.inAppNotification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async markAsRead(id, userId) {
        const notification = await this.prisma.inAppNotification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.inAppNotification.update({
            where: { id },
            data: { read: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.inAppNotification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
    mailTransporter = null;
    async getMailTransporter() {
        if (this.mailTransporter)
            return this.mailTransporter;
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (host && port && user && pass) {
            this.mailTransporter = nodemailer.createTransport({
                host,
                port: parseInt(port),
                secure: parseInt(port) === 465,
                auth: { user, pass }
            });
            this.logger.log(`Using configured SMTP server: ${host}:${port}`);
        }
        else {
            try {
                const testAccount = await nodemailer.createTestAccount();
                this.mailTransporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
                this.logger.log(`Generated Ethereal Test SMTP: ${testAccount.user}`);
            }
            catch (err) {
                this.logger.error('Failed to generate Ethereal SMTP test account, fallback to mock logger', err);
            }
        }
        return this.mailTransporter;
    }
    async sendEmail(to, subject, body) {
        this.logger.log(`dispatching email to ${to}: ${subject}`);
        const transporter = await this.getMailTransporter();
        if (transporter) {
            try {
                const from = process.env.SMTP_FROM || 'no-reply@forexmate.com';
                const info = await transporter.sendMail({
                    from,
                    to,
                    subject,
                    text: body,
                    html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">${body.replace(/\n/g, '<br/>')}</div>`
                });
                this.logger.log(`Email sent successfully: ${info.messageId}`);
                const previewUrl = nodemailer.getTestMessageUrl(info);
                if (previewUrl) {
                    this.logger.log(`✉️ Ethereal Email Preview URL: ${previewUrl}`);
                }
                return true;
            }
            catch (err) {
                this.logger.error(`Error sending email to ${to}`, err);
            }
        }
        else {
            this.logger.log(`SMTP Mock Logger fallback: [To: ${to}] [Subject: ${subject}] -> ${body}`);
        }
        return false;
    }
    async sendSMS(phone, message) {
        this.logger.log(`dispatching SMS to ${phone}: ${message}`);
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE_NUMBER;
        if (accountSid && authToken && fromPhone) {
            try {
                const client = new twilio_1.Twilio(accountSid, authToken);
                const res = await client.messages.create({
                    body: message,
                    from: fromPhone,
                    to: phone
                });
                this.logger.log(`SMS sent successfully via Twilio, SID: ${res.sid}`);
                return true;
            }
            catch (err) {
                this.logger.error(`Failed to send SMS to ${phone} via Twilio`, err);
            }
        }
        else {
            this.logger.log(`Twilio config missing. SMS Logger fallback: [To: ${phone}] -> ${message}`);
        }
        return true;
    }
    async notifyBranchOnPayment(orderId) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    branch: true,
                    profile: { include: { user: true } },
                    history: { orderBy: { createdAt: 'desc' } },
                },
            });
            if (!order) {
                this.logger.warn(`notifyBranchOnPayment: Order ${orderId} not found`);
                return;
            }
            if (!order.branchId) {
                this.logger.warn(`notifyBranchOnPayment: Order ${order.orderNumber} does not belong to a branch`);
                return;
            }
            if (order.status !== client_1.OrderStatus.PAYMENT_COMPLETED) {
                this.logger.log(`notifyBranchOnPayment: Order ${order.orderNumber} status is ${order.status}, not PAYMENT_COMPLETED`);
                return;
            }
            const unresolvedTasks = await this.prisma.branchTask.findMany({
                where: {
                    orderId,
                    status: { in: ['PENDING', 'IN_PROGRESS', 'ESCALATED'] },
                },
            });
            if (unresolvedTasks.length === 0) {
                this.logger.log(`notifyBranchOnPayment: Order ${order.orderNumber} has no unresolved branch tasks`);
                return;
            }
            const branchStaff = await this.prisma.branchStaff.findMany({
                where: { branchId: order.branchId },
                include: { user: { include: { roleRef: true } } },
            });
            const managers = branchStaff.filter((s) => s.user.roleRef?.name === 'BRANCH_MANAGER' || s.designation === 'MANAGER');
            const managerMsg = `Order ${order.orderNumber} payment completed and is ready for branch processing.`;
            for (const mgr of managers) {
                await this.prisma.inAppNotification.create({
                    data: {
                        userId: mgr.userId,
                        title: 'Paid Order Ready',
                        message: managerMsg,
                        orderId: order.id,
                        actionUrl: '/manager/queue',
                    },
                });
            }
            if (process.env.NODE_ENV !== 'production') {
                const superAdmins = await this.prisma.user.findMany({
                    where: { roleRef: { name: 'SUPER_ADMIN' } },
                });
                for (const admin of superAdmins) {
                    if (!managers.some((m) => m.userId === admin.id)) {
                        await this.prisma.inAppNotification.create({
                            data: {
                                userId: admin.id,
                                title: 'Paid Order Ready (Admin Copy)',
                                message: managerMsg,
                                orderId: order.id,
                                actionUrl: '/manager/queue',
                            },
                        });
                    }
                }
            }
            const opsStaff = branchStaff.filter((s) => s.user.roleRef?.name !== 'BRANCH_MANAGER' && s.designation !== 'MANAGER');
            const opsMsg = `Order ${order.orderNumber} has actionable branch tasks in your queue.`;
            for (const staff of opsStaff) {
                const hasCapability = unresolvedTasks.some((task) => {
                    const isSuper = staff.user.roleRef?.name === 'SUPER_ADMIN';
                    const isManager = staff.user.roleRef?.name === 'BRANCH_MANAGER';
                    const isOpsGeneral = staff.user.roleRef?.name === 'BRANCH_OPERATIONS_STAFF' || staff.user.roleRef?.name === 'STAFF' || staff.user.roleRef?.name === 'BRANCH_OPERATIONS';
                    if (isSuper || isManager || isOpsGeneral)
                        return true;
                    if (task.taskType === 'KYC_REVIEW') {
                        return staff.user.roleRef?.name === 'BRANCH_KYC_STAFF';
                    }
                    if (task.taskType === 'INVENTORY_PREP') {
                        return staff.user.roleRef?.name === 'BRANCH_INVENTORY_STAFF';
                    }
                    if (task.taskType === 'HANDOVER') {
                        return staff.user.roleRef?.name === 'BRANCH_CASHIER' || staff.user.roleRef?.name === 'BRANCH_FULFILLMENT_STAFF';
                    }
                    return false;
                });
                if (hasCapability) {
                    await this.prisma.inAppNotification.create({
                        data: {
                            userId: staff.userId,
                            title: 'Tasks Available',
                            message: opsMsg,
                            orderId: order.id,
                            actionUrl: '/ops/tasks',
                        },
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to notify branch on payment:', error);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map