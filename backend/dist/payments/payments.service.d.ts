import { PrismaService } from '../prisma/prisma.service';
import { InitializePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
import { NotificationService } from '../notification/notification.service';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';
export declare class PaymentsService {
    private prisma;
    private readonly notificationService;
    private readonly eventBus;
    private readonly logger;
    constructor(prisma: PrismaService, notificationService: NotificationService, eventBus: DomainEventBus);
    getProviders(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
    }[]>;
    initializePayment(userId: string, dto: InitializePaymentDto): Promise<{
        paymentId: string;
        attemptId: string;
        amountInr: import("@prisma/client/runtime/library").Decimal;
        gatewayOptions: {
            key: string;
            gatewayOrderId: any;
        };
    }>;
    confirmPayment(paymentId: string, dto: ConfirmPaymentDto): Promise<{
        success: boolean;
        message: string;
        orderId: string;
    }>;
}
