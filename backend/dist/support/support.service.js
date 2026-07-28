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
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SupportService = class SupportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCategories() {
        return this.prisma.ticketCategory.findMany({
            orderBy: { name: 'asc' }
        });
    }
    async getUserTickets(userId) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { updatedAt: 'desc' }
        });
    }
    async getTicketDetails(id, userId) {
        const ticket = await this.prisma.supportTicket.findFirst({
            where: { id, userId },
            include: {
                category: true,
                messages: {
                    include: { sender: { select: { fullName: true, roleRef: { select: { name: true } } } } },
                    orderBy: { createdAt: 'asc' }
                },
                activities: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async generateTicketNumber() {
        const year = new Date().getFullYear();
        const count = await this.prisma.supportTicket.count();
        const nextNumber = (count + 1).toString().padStart(6, '0');
        return `SUP-${year}-${nextNumber}`;
    }
    async createTicket(userId, data) {
        const category = await this.prisma.ticketCategory.findUnique({ where: { id: data.categoryId } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        const ticketNumber = await this.generateTicketNumber();
        const now = new Date();
        const responseDue = new Date(now.getTime() + (category.defaultPriority === 'CRITICAL' ? 1 : 24) * 60 * 60 * 1000);
        const resolutionDue = new Date(now.getTime() + (category.defaultPriority === 'CRITICAL' ? 24 : 72) * 60 * 60 * 1000);
        return this.prisma.supportTicket.create({
            data: {
                userId,
                ticketNumber,
                subject: data.subject,
                description: data.description,
                categoryId: category.id,
                priority: category.defaultPriority,
                department: category.department,
                responseDue,
                resolutionDue,
                relatedOrderId: data.relatedOrderId || null,
                relatedCardId: data.relatedCardId || null,
                relatedRemittanceId: data.relatedRemittanceId || null,
                messages: {
                    create: {
                        senderId: userId,
                        message: data.description,
                        type: client_1.TicketMessageType.TEXT
                    }
                },
                activities: {
                    create: {
                        action: `Ticket Created and routed to ${category.department} team`,
                        actorId: userId
                    }
                }
            }
        });
    }
    async addMessage(id, userId, data) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return this.prisma.$transaction(async (tx) => {
            const msg = await tx.ticketMessage.create({
                data: {
                    ticketId: id,
                    senderId: userId,
                    message: data.message,
                    type: data.type || client_1.TicketMessageType.TEXT
                },
                include: { sender: { select: { fullName: true, roleRef: { select: { name: true } } } } }
            });
            await tx.supportTicket.update({
                where: { id },
                data: {
                    status: client_1.TicketStatus.WAITING_FOR_SUPPORT,
                    updatedAt: new Date()
                }
            });
            return msg;
        });
    }
    async updateStatus(id, userId, status) {
        return this.prisma.$transaction(async (tx) => {
            const ticket = await tx.supportTicket.update({
                where: { id, userId },
                data: { status: status }
            });
            await tx.ticketActivity.create({
                data: {
                    ticketId: id,
                    actorId: userId,
                    action: `Status updated to ${status}`
                }
            });
            return ticket;
        });
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map