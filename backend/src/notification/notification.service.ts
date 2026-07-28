import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private lastActiveUsers = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {}

  // Tracks active users in-memory
  markUserActive(userId: string) {
    this.lastActiveUsers.set(userId, Date.now());
  }

  isUserOnline(userId: string): boolean {
    const lastActive = this.lastActiveUsers.get(userId);
    if (!lastActive) return false;
    // Considered online if active in the last 15 seconds
    return Date.now() - lastActive < 15000;
  }

  getOnlineUserIds(): string[] {
    const now = Date.now();
    const online: string[] = [];
    for (const [userId, lastActive] of this.lastActiveUsers.entries()) {
      if (now - lastActive < 15000) {
        online.push(userId);
      }
    }
    return online;
  }

  // Fetch notifications and automatically mark user active
  async getInAppNotifications(userId: string) {
    this.markUserActive(userId);
    return this.prisma.inAppNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.inAppNotification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.inAppNotification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  private mailTransporter: any = null;

  private async getMailTransporter() {
    if (this.mailTransporter) return this.mailTransporter;

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
    } else {
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
      } catch (err) {
        this.logger.error('Failed to generate Ethereal SMTP test account, fallback to mock logger', err);
      }
    }
    return this.mailTransporter;
  }

  async sendEmail(to: string, subject: string, body: string) {
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
      } catch (err) {
        this.logger.error(`Error sending email to ${to}`, err);
      }
    } else {
      this.logger.log(`SMTP Mock Logger fallback: [To: ${to}] [Subject: ${subject}] -> ${body}`);
    }
    return false;
  }

  async sendSMS(phone: string, message: string) {
    this.logger.log(`dispatching SMS to ${phone}: ${message}`);
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromPhone) {
      try {
        const client = new Twilio(accountSid, authToken);
        const res = await client.messages.create({
          body: message,
          from: fromPhone,
          to: phone
        });
        this.logger.log(`SMS sent successfully via Twilio, SID: ${res.sid}`);
        return true;
      } catch (err) {
        this.logger.error(`Failed to send SMS to ${phone} via Twilio`, err);
      }
    } else {
      this.logger.log(`Twilio config missing. SMS Logger fallback: [To: ${phone}] -> ${message}`);
    }
    return true;
  }

  // Payment success branch notification triggers
  async notifyBranchOnPayment(orderId: string) {
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

      // Guard 1: Must belong to a branch
      if (!order.branchId) {
        this.logger.warn(`notifyBranchOnPayment: Order ${order.orderNumber} does not belong to a branch`);
        return;
      }

      // Guard 2: Order status must be PAYMENT_COMPLETED (payment succeeded)
      if (order.status !== OrderStatus.PAYMENT_COMPLETED) {
        this.logger.log(`notifyBranchOnPayment: Order ${order.orderNumber} status is ${order.status}, not PAYMENT_COMPLETED`);
        return;
      }

      // Guard 3: Must have unresolved branch tasks (PENDING, IN_PROGRESS, or ESCALATED)
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

      // 1. Notify branch managers
      const branchStaff = await this.prisma.branchStaff.findMany({
        where: { branchId: order.branchId },
        include: { user: { include: { roleRef: true } } },
      });

      const managers = branchStaff.filter(
        (s) => s.user.roleRef?.name === 'BRANCH_MANAGER' || s.designation === 'MANAGER',
      );

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

      // Dev-only fallback/convenience duplicate to SUPER_ADMIN
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

      // 2. Notify ops-capable staff if there are actionable tasks
      const opsStaff = branchStaff.filter(
        (s) => s.user.roleRef?.name !== 'BRANCH_MANAGER' && s.designation !== 'MANAGER',
      );

      const opsMsg = `Order ${order.orderNumber} has actionable branch tasks in your queue.`;

      for (const staff of opsStaff) {
        // Double check user role capability matches any of the actionable pending tasks
        const hasCapability = unresolvedTasks.some((task) => {
          const isSuper = staff.user.roleRef?.name === 'SUPER_ADMIN';
          const isManager = staff.user.roleRef?.name === 'BRANCH_MANAGER';
          const isOpsGeneral = staff.user.roleRef?.name === 'BRANCH_OPERATIONS_STAFF' || staff.user.roleRef?.name === 'STAFF' || staff.user.roleRef?.name === 'BRANCH_OPERATIONS';
          
          if (isSuper || isManager || isOpsGeneral) return true;
          
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
    } catch (error) {
      this.logger.error('Failed to notify branch on payment:', error);
    }
  }
}

