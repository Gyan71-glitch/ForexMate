import { PaymentsService } from './payments.service';
import { InitializePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getProviders(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
    }[]>;
    initialize(dto: InitializePaymentDto, req: any): Promise<{
        paymentId: string;
        attemptId: string;
        amountInr: import("@prisma/client/runtime/library").Decimal;
        gatewayOptions: {
            key: string;
            gatewayOrderId: any;
        };
    }>;
    confirm(paymentId: string, dto: ConfirmPaymentDto): Promise<{
        success: boolean;
        message: string;
        orderId: string;
    }>;
}
