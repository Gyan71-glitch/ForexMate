import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private readonly notificationService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, notificationService: NotificationService);
    private hashToken;
    private getBrowserAndOs;
    register(data: {
        email: string;
        password: string;
        fullName?: string;
        mobile?: string;
    }): Promise<{
        message: string;
    }>;
    login(data: {
        email: string;
        password: string;
    }, ip: string, userAgent: string, deviceId?: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    private createSession;
    refresh(refreshToken: string, ip: string, userAgent: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    sendOtp(recipient: string, purpose: string): Promise<{
        message: string;
        devCode: string | undefined;
    }>;
    verifyOtp(recipient: string, purpose: string, code: string): Promise<boolean>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    getSessions(userId: string): Promise<{
        city: string | null;
        country: string | null;
        id: string;
        createdAt: Date;
        ip: string | null;
        browser: string | null;
        lastActivity: Date;
        os: string | null;
    }[]>;
    revokeSession(userId: string, sessionId: string): Promise<{
        message: string;
    }>;
    googleLogin(credential: string, ip: string, userAgent: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    validatePayload(payload: {
        sub: string;
        sessionId: string;
    }): Promise<{
        id: string;
        email: string;
        fullName: string | null;
        mobile: string | null;
        role: string;
        roleId: number | null;
        sessionId: string;
        branchId: string | null;
    } | null>;
}
