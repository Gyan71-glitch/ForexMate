import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/admin.dto';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getExecutiveMetrics(): Promise<{
        overview: {
            ordersToday: number;
            ordersMonth: number;
            pendingCompliance: number;
            pendingBranchExecution: number;
            pendingDeliveries: number;
            completedOrders: number;
            cancelledOrders: number;
            revenueToday: number;
            revenueMonth: number;
            branchesCount: number;
            citiesCount: number;
            employeesCount: number;
        };
        branchHealth: {
            id: string;
            name: string;
            city: string;
            code: string;
            manager: string;
            status: string;
            branchType: string;
            totalStock: number;
            orderCount: number;
            health: string;
        }[];
        recentLogs: {
            id: string;
            userId: string | null;
            action: string;
            entityName: string | null;
            entityId: string | null;
            oldData: import("@prisma/client/runtime/library").JsonValue | null;
            newData: import("@prisma/client/runtime/library").JsonValue | null;
            changedFields: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            actorRoleCode: string | null;
            branchId: string | null;
            createdAt: Date;
        }[];
    }>;
    getDashboardSummary(user?: any): Promise<{
        overview: {
            ordersToday: number;
            ordersMonth: number;
            pendingCompliance: number;
            pendingBranchExecution: number;
            pendingDeliveries: number;
            completedOrders: number;
            cancelledOrders: number;
            revenueToday: number;
            revenueMonth: number;
            branchesCount: number;
            citiesCount: number;
            employeesCount: number;
        };
        branchHealth: {
            id: string;
            name: string;
            city: string;
            code: string;
            manager: string;
            status: string;
            branchType: string;
            totalStock: number;
            orderCount: number;
            health: string;
        }[];
        recentLogs: {
            id: string;
            userId: string | null;
            action: string;
            entityName: string | null;
            entityId: string | null;
            oldData: import("@prisma/client/runtime/library").JsonValue | null;
            newData: import("@prisma/client/runtime/library").JsonValue | null;
            changedFields: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            actorRoleCode: string | null;
            branchId: string | null;
            createdAt: Date;
        }[];
    }>;
    getAllOrders(user?: any): Promise<{
        status: string;
        branch: {
            branchCode: string;
            branchName: string;
            branchCity: string;
        };
        profile: {
            user: {
                status: string;
                id: string;
                createdAt: Date;
                email: string;
                updatedAt: Date;
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
            };
        } & {
            id: string;
            userId: string;
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
        };
        items: ({
            product: {
                id: string;
                name: string;
                code: string;
                isActive: boolean;
            };
            currency: {
                symbol: string;
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                decimals: number;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            currencyId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            inrSubtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        cashier: {
            name: string;
            employeeCode: string;
        } | null;
        deliveryPartner: {
            name: string;
            employeeCode: string;
        } | null;
        cashAllocation: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                cashAllocationId: string;
                denomination: number;
                quantity: number;
            }[];
        } & {
            status: string;
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            currencyCode: string;
            orderId: string;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            allocatedBy: string;
            allocatedAt: Date;
        }) | null;
        complianceStatus: string;
        currentStage: string;
        deliveryMethod: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        id: string;
        branchId: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        profileId: string;
        quoteId: string | null;
        sessionId: string | null;
        assignedStaffId: string | null;
        assignedAt: Date | null;
        productType: string;
        workflowType: string;
        requiresKyc: boolean;
        requiresInventory: boolean;
        requiresPickupHandover: boolean;
        requiresDelivery: boolean;
        complianceCaseId: string | null;
        travelDestination: string | null;
        departureDate: Date | null;
        returnDate: Date | null;
        cancelRequested: boolean;
        cancelReason: string | null;
        cashierId: string | null;
        deliveryPartnerId: string | null;
        fulfillmentStatus: string | null;
        assignedCentralStaffId: string | null;
        assignedManagerId: string | null;
        currentBranchId: string | null;
        originalBranchId: string | null;
        reassignedBranchId: string | null;
        reassignmentReason: string | null;
        reassignedAt: Date | null;
        reassignedBy: string | null;
        complianceLocked: boolean;
        complianceCompletedAt: Date | null;
    }[]>;
    getAllBranches(): Promise<({
        _count: {
            orders: number;
            employees: number;
        };
        city: {
            status: string;
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            state: string;
            country: string;
            createdById: string | null;
        } | null;
        manager: {
            id: string;
            name: string;
            phone: string;
            email: string | null;
            employeeCode: string;
        } | null;
        vaults: ({
            currency: {
                symbol: string;
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                decimals: number;
            };
        } & {
            id: string;
            branchId: string;
            updatedAt: Date;
            currencyId: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
        branchInventory: {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            currencyCode: string;
            availableAmount: import("@prisma/client/runtime/library").Decimal;
            reservedAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        status: string;
        id: string;
        createdAt: Date;
        companyId: string;
        branchCode: string;
        branchName: string;
        branchAddress: string;
        branchCity: string;
        cityId: string | null;
        managerId: string | null;
        branchType: string;
        lat: number | null;
        lng: number | null;
        phone: string | null;
        email: string | null;
        vaultCapacity: import("@prisma/client/runtime/library").Decimal;
        workingHours: string | null;
        cashLimitInr: import("@prisma/client/runtime/library").Decimal;
        updatedAt: Date;
    })[]>;
    createBranch(dto: {
        branchCode: string;
        branchName: string;
        branchAddress: string;
        branchCity: string;
        cityId?: string;
        branchType?: string;
        lat?: number;
        lng?: number;
        phone?: string;
        email?: string;
        workingHours?: string;
        vaultCapacity?: number;
    }, userId?: string): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        companyId: string;
        branchCode: string;
        branchName: string;
        branchAddress: string;
        branchCity: string;
        cityId: string | null;
        managerId: string | null;
        branchType: string;
        lat: number | null;
        lng: number | null;
        phone: string | null;
        email: string | null;
        vaultCapacity: import("@prisma/client/runtime/library").Decimal;
        workingHours: string | null;
        cashLimitInr: import("@prisma/client/runtime/library").Decimal;
        updatedAt: Date;
    }>;
    updateBranch(id: string, dto: any): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        companyId: string;
        branchCode: string;
        branchName: string;
        branchAddress: string;
        branchCity: string;
        cityId: string | null;
        managerId: string | null;
        branchType: string;
        lat: number | null;
        lng: number | null;
        phone: string | null;
        email: string | null;
        vaultCapacity: import("@prisma/client/runtime/library").Decimal;
        workingHours: string | null;
        cashLimitInr: import("@prisma/client/runtime/library").Decimal;
        updatedAt: Date;
    }>;
    assignBranchManager(branchId: string, employeeId: string, adminUserId?: string): Promise<{
        manager: {
            status: import(".prisma/client").$Enums.EmployeeStatus;
            id: string;
            branchId: string;
            createdAt: Date;
            name: string;
            cityId: string | null;
            phone: string;
            email: string | null;
            updatedAt: Date;
            employeeCode: string;
            photoUrl: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.EmployeeRole;
            reportingManagerId: string | null;
            mustChangePassword: boolean;
            lastLoginAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
        } | null;
    } & {
        status: string;
        id: string;
        createdAt: Date;
        companyId: string;
        branchCode: string;
        branchName: string;
        branchAddress: string;
        branchCity: string;
        cityId: string | null;
        managerId: string | null;
        branchType: string;
        lat: number | null;
        lng: number | null;
        phone: string | null;
        email: string | null;
        vaultCapacity: import("@prisma/client/runtime/library").Decimal;
        workingHours: string | null;
        cashLimitInr: import("@prisma/client/runtime/library").Decimal;
        updatedAt: Date;
    }>;
    getAuditLogs(): Promise<({
        user: {
            email: string;
            fullName: string | null;
        } | null;
    } & {
        id: string;
        userId: string | null;
        action: string;
        entityName: string | null;
        entityId: string | null;
        oldData: import("@prisma/client/runtime/library").JsonValue | null;
        newData: import("@prisma/client/runtime/library").JsonValue | null;
        changedFields: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        actorRoleCode: string | null;
        branchId: string | null;
        createdAt: Date;
    })[]>;
    getSystemSettings(): Promise<{
        id: string;
        description: string | null;
        updatedAt: Date;
        key: string;
        value: string;
        category: string;
        isEncrypted: boolean;
        updatedById: string | null;
    }[]>;
    updateSystemSetting(key: string, value: string, category?: string): Promise<{
        id: string;
        description: string | null;
        updatedAt: Date;
        key: string;
        value: string;
        category: string;
        isEncrypted: boolean;
        updatedById: string | null;
    }>;
    createStaff(dto: CreateStaffDto): Promise<{
        roleRef: {
            id: number;
            name: string;
        } | null;
    } & {
        status: string;
        id: string;
        createdAt: Date;
        email: string;
        updatedAt: Date;
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
    }>;
    getStaffList(): Promise<({
        staffProfile: ({
            branch: {
                status: string;
                id: string;
                createdAt: Date;
                companyId: string;
                branchCode: string;
                branchName: string;
                branchAddress: string;
                branchCity: string;
                cityId: string | null;
                managerId: string | null;
                branchType: string;
                lat: number | null;
                lng: number | null;
                phone: string | null;
                email: string | null;
                vaultCapacity: import("@prisma/client/runtime/library").Decimal;
                workingHours: string | null;
                cashLimitInr: import("@prisma/client/runtime/library").Decimal;
                updatedAt: Date;
            };
        } & {
            status: string;
            id: string;
            userId: string;
            branchId: string;
            designation: string;
            joiningDate: Date;
        }) | null;
        roleRef: {
            id: number;
            name: string;
        } | null;
    } & {
        status: string;
        id: string;
        createdAt: Date;
        email: string;
        updatedAt: Date;
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
    changeUserRole(userId: string, roleName: string): Promise<{
        roleRef: {
            id: number;
            name: string;
        } | null;
    } & {
        status: string;
        id: string;
        createdAt: Date;
        email: string;
        updatedAt: Date;
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
    }>;
    changeUserStatus(userId: string, status: string): Promise<{
        staffProfile: {
            status: string;
            id: string;
            userId: string;
            branchId: string;
            designation: string;
            joiningDate: Date;
        } | null;
        roleRef: {
            id: number;
            name: string;
        } | null;
    } & {
        status: string;
        id: string;
        createdAt: Date;
        email: string;
        updatedAt: Date;
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
    }>;
}
