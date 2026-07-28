import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationService {
    private readonly prisma;
    private readonly logger;
    private lastActiveUsers;
    constructor(prisma: PrismaService);
    markUserActive(userId: string): void;
    isUserOnline(userId: string): boolean;
    getOnlineUserIds(): string[];
    getInAppNotifications(userId: string): Promise<{
        userId: string;
        id: string;
        title: string;
        message: string;
        orderId: string | null;
        actionUrl: string | null;
        read: boolean;
        createdAt: Date;
    }[]>;
    markAsRead(id: string, userId: string): Promise<{
        userId: string;
        id: string;
        title: string;
        message: string;
        orderId: string | null;
        actionUrl: string | null;
        read: boolean;
        createdAt: Date;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    private mailTransporter;
    private getMailTransporter;
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
    sendSMS(phone: string, message: string): Promise<boolean>;
    notifyBranchOnPayment(orderId: string): Promise<void>;
}
