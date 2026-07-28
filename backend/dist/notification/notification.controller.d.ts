import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: any): Promise<{
        userId: string;
        id: string;
        title: string;
        message: string;
        orderId: string | null;
        actionUrl: string | null;
        read: boolean;
        createdAt: Date;
    }[]>;
    readNotification(id: string, req: any): Promise<{
        userId: string;
        id: string;
        title: string;
        message: string;
        orderId: string | null;
        actionUrl: string | null;
        read: boolean;
        createdAt: Date;
    }>;
    readAllNotifications(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
