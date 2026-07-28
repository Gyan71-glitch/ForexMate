import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../../notification/notification.service';
export declare class DevPaymentService {
    private readonly prisma;
    private readonly notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    mockPayOrder(orderId: string, scenario: string): Promise<{
        success: boolean;
        scenario: "PENDING" | "CANCELLED" | "TIMEOUT" | "SUCCESS" | "REFUNDED" | "FAILURE" | "DUPLICATE" | "WEBHOOK_FAILURE";
        orderId: string;
    }>;
}
