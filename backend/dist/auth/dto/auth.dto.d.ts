export declare class LoginDto {
    email: string;
    password: string;
    deviceId?: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    mobile: string;
}
export declare class GoogleLoginDto {
    credential: string;
}
export declare class SendOtpDto {
    recipient: string;
    purpose: string;
}
export declare class VerifyOtpDto {
    recipient: string;
    purpose: string;
    code: string;
}
export declare class RequestResetDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
