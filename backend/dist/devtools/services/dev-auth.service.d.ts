import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class DevAuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    private hashToken;
    generateImpersonationToken(email: string, roleOverride?: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    getSessions(): Promise<({
        roleRef: {
            id: number;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        email: string;
        password: string;
        fullName: string | null;
        mobile: string | null;
        userType: import(".prisma/client").$Enums.UserType;
        roleId: number | null;
        failedAttempts: number;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        lockoutUntil: Date | null;
        mfaBackupCodesHash: string | null;
        mfaEnabled: boolean;
        mfaPreferredMethod: string;
        mfaSecret: string | null;
    })[]>;
}
