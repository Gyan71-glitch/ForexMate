import { WorkforceService } from './workforce.service';
import { WorkforceLoginDto, WorkforceChangePasswordDto, SendCustomerOtpDto, VerifyCustomerOtpDto, CompleteDeliveryDto, CompleteCashSellDto, ReassignBranchDto, AssignDeliveryPartnerDto, ManagerCompletePickupDto, ReceiveBranchInventoryDto } from './dto/workforce.dto';
export declare class WorkforceController {
    private readonly workforceService;
    constructor(workforceService: WorkforceService);
    login(dto: WorkforceLoginDto): Promise<{
        access_token: string;
        employee: {
            id: string;
            employeeCode: string;
            name: string;
            role: import(".prisma/client").$Enums.EmployeeRole;
            branchId: string;
            branchName: string;
            phone: string;
            email: string | null;
            mustChangePassword: boolean;
        };
    }>;
    changePassword(dto: WorkforceChangePasswordDto, req: any): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<{
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
        reportingManagerId: string | null;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    getOrders(req: any): Promise<{
        pickup: ({
            branch: {
                branchCode: string;
                branchName: string;
            };
            deliveryJob: {
                id: string;
                orderId: string;
                deliveryAddress: string;
                contactPerson: string;
                dispatchAt: Date | null;
                deliveryAgent: string | null;
                deliveryOtpCode: string | null;
                deliveredAt: Date | null;
                failedAttemptReason: string | null;
                signatureData: string | null;
                photoData: string | null;
                reachedCustomerAt: Date | null;
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
                    email: string;
                    fullName: string | null;
                    mobile: string | null;
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
            deliveries: ({
                address: {
                    city: string;
                    id: string;
                    profileId: string;
                    status: string;
                    pin: string;
                    state: string;
                    address: string;
                    landmark: string | null;
                    addressType: string;
                } | null;
            } & {
                id: string;
                orderId: string;
                status: string;
                addressId: string | null;
                courierPartner: string | null;
                trackingNumber: string | null;
                dispatchDate: Date | null;
                deliveredDate: Date | null;
            })[];
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
        } & {
            id: string;
            createdAt: Date;
            orderNumber: string;
            profileId: string;
            branchId: string;
            totalAmountInr: import("@prisma/client/runtime/library").Decimal;
            deliveryMethod: string;
            status: import(".prisma/client").$Enums.OrderStatus;
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
        })[];
        cashSell: ({
            branch: {
                branchCode: string;
                branchName: string;
            };
            deliveryJob: {
                id: string;
                orderId: string;
                deliveryAddress: string;
                contactPerson: string;
                dispatchAt: Date | null;
                deliveryAgent: string | null;
                deliveryOtpCode: string | null;
                deliveredAt: Date | null;
                failedAttemptReason: string | null;
                signatureData: string | null;
                photoData: string | null;
                reachedCustomerAt: Date | null;
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
                    email: string;
                    fullName: string | null;
                    mobile: string | null;
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
            deliveries: ({
                address: {
                    city: string;
                    id: string;
                    profileId: string;
                    status: string;
                    pin: string;
                    state: string;
                    address: string;
                    landmark: string | null;
                    addressType: string;
                } | null;
            } & {
                id: string;
                orderId: string;
                status: string;
                addressId: string | null;
                courierPartner: string | null;
                trackingNumber: string | null;
                dispatchDate: Date | null;
                deliveredDate: Date | null;
            })[];
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
        } & {
            id: string;
            createdAt: Date;
            orderNumber: string;
            profileId: string;
            branchId: string;
            totalAmountInr: import("@prisma/client/runtime/library").Decimal;
            deliveryMethod: string;
            status: import(".prisma/client").$Enums.OrderStatus;
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
        })[];
        deliveries?: undefined;
        reassigned?: undefined;
        branchInventory?: undefined;
        cityInventory?: undefined;
    } | {
        pickup: ({
            branch: {
                branchCode: string;
                branchName: string;
            };
            deliveryJob: {
                id: string;
                orderId: string;
                deliveryAddress: string;
                contactPerson: string;
                dispatchAt: Date | null;
                deliveryAgent: string | null;
                deliveryOtpCode: string | null;
                deliveredAt: Date | null;
                failedAttemptReason: string | null;
                signatureData: string | null;
                photoData: string | null;
                reachedCustomerAt: Date | null;
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
                    email: string;
                    fullName: string | null;
                    mobile: string | null;
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
            deliveries: ({
                address: {
                    city: string;
                    id: string;
                    profileId: string;
                    status: string;
                    pin: string;
                    state: string;
                    address: string;
                    landmark: string | null;
                    addressType: string;
                } | null;
            } & {
                id: string;
                orderId: string;
                status: string;
                addressId: string | null;
                courierPartner: string | null;
                trackingNumber: string | null;
                dispatchDate: Date | null;
                deliveredDate: Date | null;
            })[];
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
        } & {
            id: string;
            createdAt: Date;
            orderNumber: string;
            profileId: string;
            branchId: string;
            totalAmountInr: import("@prisma/client/runtime/library").Decimal;
            deliveryMethod: string;
            status: import(".prisma/client").$Enums.OrderStatus;
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
        })[];
        deliveries: ({
            branch: {
                branchCode: string;
                branchName: string;
            };
            deliveryJob: {
                id: string;
                orderId: string;
                deliveryAddress: string;
                contactPerson: string;
                dispatchAt: Date | null;
                deliveryAgent: string | null;
                deliveryOtpCode: string | null;
                deliveredAt: Date | null;
                failedAttemptReason: string | null;
                signatureData: string | null;
                photoData: string | null;
                reachedCustomerAt: Date | null;
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
                    email: string;
                    fullName: string | null;
                    mobile: string | null;
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
            deliveries: ({
                address: {
                    city: string;
                    id: string;
                    profileId: string;
                    status: string;
                    pin: string;
                    state: string;
                    address: string;
                    landmark: string | null;
                    addressType: string;
                } | null;
            } & {
                id: string;
                orderId: string;
                status: string;
                addressId: string | null;
                courierPartner: string | null;
                trackingNumber: string | null;
                dispatchDate: Date | null;
                deliveredDate: Date | null;
            })[];
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
        } & {
            id: string;
            createdAt: Date;
            orderNumber: string;
            profileId: string;
            branchId: string;
            totalAmountInr: import("@prisma/client/runtime/library").Decimal;
            deliveryMethod: string;
            status: import(".prisma/client").$Enums.OrderStatus;
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
        })[];
        reassigned: ({
            branch: {
                branchCode: string;
                branchName: string;
            };
            deliveryJob: {
                id: string;
                orderId: string;
                deliveryAddress: string;
                contactPerson: string;
                dispatchAt: Date | null;
                deliveryAgent: string | null;
                deliveryOtpCode: string | null;
                deliveredAt: Date | null;
                failedAttemptReason: string | null;
                signatureData: string | null;
                photoData: string | null;
                reachedCustomerAt: Date | null;
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
                    email: string;
                    fullName: string | null;
                    mobile: string | null;
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
            deliveries: ({
                address: {
                    city: string;
                    id: string;
                    profileId: string;
                    status: string;
                    pin: string;
                    state: string;
                    address: string;
                    landmark: string | null;
                    addressType: string;
                } | null;
            } & {
                id: string;
                orderId: string;
                status: string;
                addressId: string | null;
                courierPartner: string | null;
                trackingNumber: string | null;
                dispatchDate: Date | null;
                deliveredDate: Date | null;
            })[];
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
        } & {
            id: string;
            createdAt: Date;
            orderNumber: string;
            profileId: string;
            branchId: string;
            totalAmountInr: import("@prisma/client/runtime/library").Decimal;
            deliveryMethod: string;
            status: import(".prisma/client").$Enums.OrderStatus;
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
        })[];
        branchInventory: never[] | {
            id: string;
            createdAt: Date;
            branchId: string;
            updatedAt: Date;
            currencyCode: string;
            availableAmount: import("@prisma/client/runtime/library").Decimal;
            reservedAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
        cityInventory: never[] | ({
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
            id: string;
            createdAt: Date;
            branchId: string;
            updatedAt: Date;
            currencyCode: string;
            availableAmount: import("@prisma/client/runtime/library").Decimal;
            reservedAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
        cashSell?: undefined;
    } | {
        deliveries: ({
            branch: {
                branchCode: string;
                branchName: string;
            };
            deliveryJob: {
                id: string;
                orderId: string;
                deliveryAddress: string;
                contactPerson: string;
                dispatchAt: Date | null;
                deliveryAgent: string | null;
                deliveryOtpCode: string | null;
                deliveredAt: Date | null;
                failedAttemptReason: string | null;
                signatureData: string | null;
                photoData: string | null;
                reachedCustomerAt: Date | null;
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
                    email: string;
                    fullName: string | null;
                    mobile: string | null;
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
            deliveries: ({
                address: {
                    city: string;
                    id: string;
                    profileId: string;
                    status: string;
                    pin: string;
                    state: string;
                    address: string;
                    landmark: string | null;
                    addressType: string;
                } | null;
            } & {
                id: string;
                orderId: string;
                status: string;
                addressId: string | null;
                courierPartner: string | null;
                trackingNumber: string | null;
                dispatchDate: Date | null;
                deliveredDate: Date | null;
            })[];
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
        } & {
            id: string;
            createdAt: Date;
            orderNumber: string;
            profileId: string;
            branchId: string;
            totalAmountInr: import("@prisma/client/runtime/library").Decimal;
            deliveryMethod: string;
            status: import(".prisma/client").$Enums.OrderStatus;
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
        })[];
        pickup?: undefined;
        cashSell?: undefined;
        reassigned?: undefined;
        branchInventory?: undefined;
        cityInventory?: undefined;
    } | {
        pickup?: undefined;
        cashSell?: undefined;
        deliveries?: undefined;
        reassigned?: undefined;
        branchInventory?: undefined;
        cityInventory?: undefined;
    }>;
    getHistory(req: any): Promise<({
        branch: {
            branchCode: string;
            branchName: string;
        };
        deliveryJob: {
            id: string;
            orderId: string;
            deliveryAddress: string;
            contactPerson: string;
            dispatchAt: Date | null;
            deliveryAgent: string | null;
            deliveryOtpCode: string | null;
            deliveredAt: Date | null;
            failedAttemptReason: string | null;
            signatureData: string | null;
            photoData: string | null;
            reachedCustomerAt: Date | null;
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
                email: string;
                fullName: string | null;
                mobile: string | null;
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
        deliveries: ({
            address: {
                city: string;
                id: string;
                profileId: string;
                status: string;
                pin: string;
                state: string;
                address: string;
                landmark: string | null;
                addressType: string;
            } | null;
        } & {
            id: string;
            orderId: string;
            status: string;
            addressId: string | null;
            courierPartner: string | null;
            trackingNumber: string | null;
            dispatchDate: Date | null;
            deliveredDate: Date | null;
        })[];
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
    } & {
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    })[]>;
    getCityInventory(req: any): Promise<{
        city: string;
        branches: ({
            branchInventory: {
                id: string;
                createdAt: Date;
                branchId: string;
                updatedAt: Date;
                currencyCode: string;
                availableAmount: import("@prisma/client/runtime/library").Decimal;
                reservedAmount: import("@prisma/client/runtime/library").Decimal;
            }[];
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
        })[];
    }>;
    getOrder(id: string, req: any): Promise<{
        branch: {
            branchCode: string;
            branchName: string;
        };
        pickupHandover: {
            id: string;
            orderId: string;
            pickupBranchId: string;
            pickupOtpCode: string;
            handoverVerifiedByCashierId: string | null;
            handoverCompletedAt: Date | null;
        } | null;
        deliveryJob: {
            id: string;
            orderId: string;
            deliveryAddress: string;
            contactPerson: string;
            dispatchAt: Date | null;
            deliveryAgent: string | null;
            deliveryOtpCode: string | null;
            deliveredAt: Date | null;
            failedAttemptReason: string | null;
            signatureData: string | null;
            photoData: string | null;
            reachedCustomerAt: Date | null;
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
                email: string;
                fullName: string | null;
                mobile: string | null;
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
        deliveries: ({
            address: {
                city: string;
                id: string;
                profileId: string;
                status: string;
                pin: string;
                state: string;
                address: string;
                landmark: string | null;
                addressType: string;
            } | null;
        } & {
            id: string;
            orderId: string;
            status: string;
            addressId: string | null;
            courierPartner: string | null;
            trackingNumber: string | null;
            dispatchDate: Date | null;
            deliveredDate: Date | null;
        })[];
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
    } & {
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    sendOtp(id: string, dto: SendCustomerOtpDto, req: any): Promise<{
        message: string;
        devCode: string | undefined;
    }>;
    verifyOtp(id: string, dto: VerifyCustomerOtpDto, req: any): Promise<{
        verified: boolean;
    }>;
    reassignBranch(id: string, dto: ReassignBranchDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    managerCompletePickup(id: string, dto: ManagerCompletePickupDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    assignDeliveryPartner(id: string, dto: AssignDeliveryPartnerDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    receiveBranchInventory(dto: ReceiveBranchInventoryDto, req: any): Promise<{
        success: boolean;
        inventory: {
            id: string;
            createdAt: Date;
            branchId: string;
            updatedAt: Date;
            currencyCode: string;
            availableAmount: import("@prisma/client/runtime/library").Decimal;
            reservedAmount: import("@prisma/client/runtime/library").Decimal;
        };
        message: string;
    }>;
    completePickup(id: string, req: any): Promise<{
        message: string;
    }>;
    completeCashSell(id: string, dto: CompleteCashSellDto, req: any): Promise<{
        message: string;
    }>;
    reachedCustomer(id: string, req: any): Promise<{
        message: string;
    }>;
    completeDelivery(id: string, dto: CompleteDeliveryDto, req: any): Promise<{
        message: string;
    }>;
    allocateCash(id: string, body: {
        items: {
            denomination: number;
            quantity: number;
        }[];
    }, req: any): Promise<{
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
    }>;
    getManagerDashboard(req: any): Promise<{
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
        branchInventory: {
            id: string;
            createdAt: Date;
            branchId: string;
            updatedAt: Date;
            currencyCode: string;
            availableAmount: import("@prisma/client/runtime/library").Decimal;
            reservedAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
        metrics: {
            todayOrdersCount: number;
            pendingPickupsCount: number;
            pendingDeliveriesCount: number;
            completedTodayCount: number;
            pendingCashAllocationCount: number;
            reservedCurrencyUnits: number;
            vaultBalanceUnits: number;
            availableVaultUnits: number;
            todayRevenueInr: number;
            lowInventoryAlertsCount: number;
        };
        lowStockAlerts: {
            id: string;
            createdAt: Date;
            branchId: string;
            updatedAt: Date;
            currencyCode: string;
            availableAmount: import("@prisma/client/runtime/library").Decimal;
            reservedAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
        recentActivity: {
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
    getDeliveryPartners(req: any): Promise<{
        id: string;
        employeeCode: string;
        name: string;
        phone: string;
        status: string;
        branchName: string;
        activeDeliveriesCount: number;
        activeOrders: {
            id: string;
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            fulfillmentStatus: string | null;
        }[];
    }[]>;
    getManagerReports(req: any): Promise<{
        todayOrders: number;
        weeklyOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalOrders: number;
        currencySold: Record<string, number>;
        deliveryEfficiency: string;
        branchSlaScore: string;
    }>;
    getManagerTimeline(req: any): Promise<{
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
    }[]>;
    holdOrder(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    escalateOrder(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    reportFraud(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    cancelPickup(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
}
