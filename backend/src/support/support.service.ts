import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketPriority, TicketStatus, TicketMessageType } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.ticketCategory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getTicketDetails(id: string, userId: string) {
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

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.supportTicket.count();
    const nextNumber = (count + 1).toString().padStart(6, '0');
    return `SUP-${year}-${nextNumber}`;
  }

  async createTicket(userId: string, data: any) {
    const category = await this.prisma.ticketCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const ticketNumber = await this.generateTicketNumber();

    // Calculate SLAs (Mocking simple SLA: 1 hour for critical/high, 24 for med/low)
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
            message: data.description, // Initial message
            type: TicketMessageType.TEXT
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

  async addMessage(id: string, userId: string, data: { message: string, type?: string }) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: userId,
          message: data.message,
          type: (data.type as TicketMessageType) || TicketMessageType.TEXT
        },
        include: { sender: { select: { fullName: true, roleRef: { select: { name: true } } } } }
      });

      // Update ticket status
      await tx.supportTicket.update({
        where: { id },
        data: { 
          status: TicketStatus.WAITING_FOR_SUPPORT,
          updatedAt: new Date()
        }
      });

      return msg;
    });
  }

  async updateStatus(id: string, userId: string, status: string) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.update({
        where: { id, userId },
        data: { status: status as TicketStatus }
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
}
