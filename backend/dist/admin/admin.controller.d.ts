import { AdminService } from './admin.service';
import { CreateStaffDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardSummary(): Promise<{
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
            userId: string | null;
            id: string;
            createdAt: Date;
            branchId: string | null;
            action: string;
            entityName: string | null;
            entityId: string | null;
            oldData: import("@prisma/client/runtime/library").JsonValue | null;
            newData: import("@prisma/client/runtime/library").JsonValue | null;
            changedFields: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            actorRoleCode: string | null;
        }[];
    }>;
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
            userId: string | null;
            id: string;
            createdAt: Date;
            branchId: string | null;
            action: string;
            entityName: string | null;
            entityId: string | null;
            oldData: import("@prisma/client/runtime/library").JsonValue | null;
            newData: import("@prisma/client/runtime/library").JsonValue | null;
            changedFields: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            actorRoleCode: string | null;
        }[];
    }>;
    getAllOrders(req: any): Promise<{
        status: string;
        branch: {
            branchCode: string;
            branchName: string;
            branchCity: string;
        };
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
                quantity: number;
                denomination: number;
                cashAllocationId: string;
            }[];
        } & {
            id: string;
            orderId: string;
            createdAt: Date;
            branchId: string;
            status: string;
            updatedAt: Date;
            currencyCode: string;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            allocatedBy: string;
            allocatedAt: Date;
        }) | null;
        profile: {
            user: {
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
            };
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
        };
        items: ({
            currency: {
                symbol: string;
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                decimals: number;
            };
            product: {
                id: string;
                name: string;
                code: string;
                isActive: boolean;
            };
        } & {
            id: string;
            orderId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            inrSubtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            currencyId: string;
        })[];
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        updatedAt: Date;
        quoteId: string | null;
        sessionId: string | null;
        assignedStaffId: string | null;
        assignedAt: Date | null;
        productType: string;
        workflowType: string;
        currentStage: string;
        requiresKyc: boolean;
        requiresInventory: boolean;
        requiresPickupHandover: boolean;
        requiresDelivery: boolean;
        complianceStatus: string;
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
        city: {
            country: string;
            id: string;
            createdAt: Date;
            name: string;
            status: string;
            updatedAt: Date;
            state: string;
            createdById: string | null;
        } | null;
        branchInventory: {
            id: string;
            createdAt: Date;
            branchId: string;
            updatedAt: Date;
            currencyCode: string;
            availableAmount: import("@prisma/client/runtime/library").Decimal;
            reservedAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
        _count: {
            orders: number;
            employees: number;
        };
        manager: {
            id: string;
            name: string;
            email: string | null;
            phone: string;
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
    } & {
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        email: string | null;
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
        vaultCapacity: import("@prisma/client/runtime/library").Decimal;
        workingHours: string | null;
        cashLimitInr: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createBranch(dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        email: string | null;
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
        vaultCapacity: import("@prisma/client/runtime/library").Decimal;
        workingHours: string | null;
        cashLimitInr: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateBranch(id: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        email: string | null;
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
        vaultCapacity: import("@prisma/client/runtime/library").Decimal;
        workingHours: string | null;
        cashLimitInr: import("@prisma/client/runtime/library").Decimal;
    }>;
    assignBranchManager(id: string, employeeId: string, req: any): Promise<{
        manager: {
            role: import(".prisma/client").$Enums.EmployeeRole;
            id: string;
            createdAt: Date;
            name: string;
            branchId: string;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            updatedAt: Date;
            email: string | null;
            cityId: string | null;
            phone: string;
            employeeCode: string;
            photoUrl: string | null;
            passwordHash: string;
            reportingManagerId: string | null;
            mustChangePassword: boolean;
            lastLoginAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        email: string | null;
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
        vaultCapacity: import("@prisma/client/runtime/library").Decimal;
        workingHours: string | null;
        cashLimitInr: import("@prisma/client/runtime/library").Decimal;
    }>;
    getAuditLogs(): Promise<({
        user: {
            email: string;
            fullName: string | null;
        } | null;
    } & {
        userId: string | null;
        id: string;
        createdAt: Date;
        branchId: string | null;
        action: string;
        entityName: string | null;
        entityId: string | null;
        oldData: import("@prisma/client/runtime/library").JsonValue | null;
        newData: import("@prisma/client/runtime/library").JsonValue | null;
        changedFields: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        actorRoleCode: string | null;
    })[]>;
    getSystemSettings(): Promise<{
        id: string;
        updatedAt: Date;
        description: string | null;
        key: string;
        value: string;
        category: string;
        isEncrypted: boolean;
        updatedById: string | null;
    }[]>;
    updateSystemSetting(body: {
        key: string;
        value: string;
        category?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        description: string | null;
        key: string;
        value: string;
        category: string;
        isEncrypted: boolean;
        updatedById: string | null;
    }>;
    getStaffList(): Promise<({
        roleRef: {
            id: number;
            name: string;
        } | null;
        staffProfile: ({
            branch: {
                id: string;
                createdAt: Date;
                status: string;
                updatedAt: Date;
                email: string | null;
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
                vaultCapacity: import("@prisma/client/runtime/library").Decimal;
                workingHours: string | null;
                cashLimitInr: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            userId: string;
            id: string;
            branchId: string;
            status: string;
            designation: string;
            joiningDate: Date;
        }) | null;
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
    createStaff(dto: CreateStaffDto): Promise<{
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
    }>;
    changeUserRole(id: string, role: string): Promise<{
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
    }>;
    changeUserStatus(id: string, status: string): Promise<{
        roleRef: {
            id: number;
            name: string;
        } | null;
        staffProfile: {
            userId: string;
            id: string;
            branchId: string;
            status: string;
            designation: string;
            joiningDate: Date;
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
    }>;
}
