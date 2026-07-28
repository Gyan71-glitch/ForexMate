import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';
import { NotificationService } from '../notification/notification.service';
export declare class InvoiceService implements OnModuleInit {
    private readonly prisma;
    private readonly eventBus;
    private readonly notificationService;
    private readonly logger;
    constructor(prisma: PrismaService, eventBus: DomainEventBus, notificationService: NotificationService);
    onModuleInit(): void;
    private generateInvoiceAndReceipt;
}
