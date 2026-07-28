export declare class InitializePaymentDto {
    orderId: string;
    providerId: string;
}
export declare class ConfirmPaymentDto {
    gatewayTxnId: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
}
