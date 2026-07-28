export declare class WorkforceLoginDto {
    employeeCode: string;
    password: string;
}
export declare class WorkforceChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class SendCustomerOtpDto {
    recipient: string;
}
export declare class VerifyCustomerOtpDto {
    recipient: string;
    code: string;
}
export declare class CompleteDeliveryDto {
    signatureData: string;
    photoData: string;
    otpVerified?: boolean;
}
export declare class CompleteCashSellDto {
    notes?: string;
}
export declare class ReassignBranchDto {
    targetBranchId: string;
    reason: string;
}
export declare class AssignDeliveryPartnerDto {
    deliveryPartnerId: string;
}
export declare class ManagerCompletePickupDto {
    otp: string;
    photoUrl?: string;
    remarks?: string;
}
export declare class ReceiveBranchInventoryDto {
    currencyCode: string;
    amount: number;
    sourceType: string;
    referenceNumber: string;
    receivedDate?: string;
    notes?: string;
    treasurySlipPhotoUrl?: string;
    currencyBundlePhotoUrl?: string;
    vaultShelfPhotoUrl?: string;
}
