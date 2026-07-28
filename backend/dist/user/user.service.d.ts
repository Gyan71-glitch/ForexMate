import { PrismaService } from '../prisma/prisma.service';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsers(): Promise<{
        id: string;
        createdAt: Date;
        roleRef: {
            name: string;
        } | null;
        email: string;
        fullName: string | null;
        mobile: string | null;
    }[]>;
    getUserProfile(id: string): Promise<({
        profiles: ({
            addresses: {
                city: string;
                id: string;
                profileId: string;
                status: string;
                pin: string;
                state: string;
                address: string;
                landmark: string | null;
                addressType: string;
            }[];
            banks: {
                id: string;
                profileId: string;
                status: string;
                bankName: string;
                holderName: string;
                accountNumber: string;
                ifscCode: string;
                bankAddress: string | null;
            }[];
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            passportNo: string | null;
            passportExpiry: Date | null;
            panNumber: string | null;
            dob: Date | null;
            gender: string | null;
            nationality: string | null;
            occupation: string | null;
            annualIncome: import("@prisma/client/runtime/library").Decimal | null;
            travelPurpose: string | null;
            riskCategory: string;
            kycOverallStatus: string;
            lastKycReviewedAt: Date | null;
        }) | null;
        KycDocument: {
            userId: string;
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.KycStatus;
            docType: string;
            filePath: string;
        }[];
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
    }) | null>;
    updateProfile(userId: string, data: any): Promise<({
        profiles: ({
            addresses: {
                city: string;
                id: string;
                profileId: string;
                status: string;
                pin: string;
                state: string;
                address: string;
                landmark: string | null;
                addressType: string;
            }[];
            banks: {
                id: string;
                profileId: string;
                status: string;
                bankName: string;
                holderName: string;
                accountNumber: string;
                ifscCode: string;
                bankAddress: string | null;
            }[];
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            passportNo: string | null;
            passportExpiry: Date | null;
            panNumber: string | null;
            dob: Date | null;
            gender: string | null;
            nationality: string | null;
            occupation: string | null;
            annualIncome: import("@prisma/client/runtime/library").Decimal | null;
            travelPurpose: string | null;
            riskCategory: string;
            kycOverallStatus: string;
            lastKycReviewedAt: Date | null;
        }) | null;
        KycDocument: {
            userId: string;
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.KycStatus;
            docType: string;
            filePath: string;
        }[];
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
    }) | null>;
    addBank(userId: string, data: any): Promise<{
        id: string;
        profileId: string;
        status: string;
        bankName: string;
        holderName: string;
        accountNumber: string;
        ifscCode: string;
        bankAddress: string | null;
    }>;
    addAddress(userId: string, data: any): Promise<{
        city: string;
        id: string;
        profileId: string;
        status: string;
        pin: string;
        state: string;
        address: string;
        landmark: string | null;
        addressType: string;
    }>;
    updateAddress(addressId: string, data: any): Promise<{
        city: string;
        id: string;
        profileId: string;
        status: string;
        pin: string;
        state: string;
        address: string;
        landmark: string | null;
        addressType: string;
    }>;
    deleteAddress(addressId: string): Promise<{
        city: string;
        id: string;
        profileId: string;
        status: string;
        pin: string;
        state: string;
        address: string;
        landmark: string | null;
        addressType: string;
    }>;
    deleteBank(bankId: string): Promise<{
        id: string;
        profileId: string;
        status: string;
        bankName: string;
        holderName: string;
        accountNumber: string;
        ifscCode: string;
        bankAddress: string | null;
    }>;
    addKycDocument(userId: string, data: any): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
        docType: string;
        filePath: string;
    }>;
}
