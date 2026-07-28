import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, GoogleLoginDto, SendOtpDto, VerifyOtpDto, RequestResetDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    private setRefreshCookie;
    private clearRefreshCookie;
    login(dto: LoginDto, ip: string, userAgent: string, res: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    staffLogin(dto: LoginDto, ip: string, userAgent: string, res: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    googleLogin(dto: GoogleLoginDto, ip: string, userAgent: string, res: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    refresh(req: any, ip: string, userAgent: string, res: any): Promise<{
        access_token: string;
    }>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<any>;
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
        devCode: string | undefined;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        verified: boolean;
    }>;
    requestReset(dto: RequestResetDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getSessions(req: any): Promise<{
        city: string | null;
        country: string | null;
        id: string;
        createdAt: Date;
        ip: string | null;
        browser: string | null;
        lastActivity: Date;
        os: string | null;
    }[]>;
    revokeSession(req: any, sessionId: string): Promise<{
        message: string;
    }>;
}
