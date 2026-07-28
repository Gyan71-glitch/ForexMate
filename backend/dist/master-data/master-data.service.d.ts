import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, CreateCurrencyDto } from './dto/master-data.dto';
export declare class MasterDataService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAggregatedMasterData(): Promise<{
        currencies: {
            symbol: string;
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            decimals: number;
        }[];
        countries: {
            id: string;
            name: string;
            nationality: string;
            iso2: string;
            iso3: string;
        }[];
        branches: {
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
        }[];
        products: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
        }[];
        purposeCodes: ({
            complianceRules: {
                id: string;
                action: string;
                isActive: boolean;
                ruleName: string;
                purposeCodeId: string;
                conditionJson: import("@prisma/client/runtime/library").JsonValue;
                requiredDocuments: string[];
            }[];
        } & {
            id: string;
            name: string;
            description: string | null;
            code: string;
            countryId: string | null;
            lrsApplicable: boolean;
        })[];
        taxes: {
            id: string;
            name: string;
            isActive: boolean;
            taxType: string;
            percentage: number;
            fixedAmount: import("@prisma/client/runtime/library").Decimal;
            minAmount: import("@prisma/client/runtime/library").Decimal | null;
            maxAmount: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        fees: {
            id: string;
            isActive: boolean;
            amount: import("@prisma/client/runtime/library").Decimal;
            currencyId: string;
            feeType: string;
        }[];
        marginRules: {
            id: string;
            updatedAt: Date;
            segment: string;
            marginPct: number;
        }[];
    }>;
    addBranch(dto: CreateBranchDto): Promise<{
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
    addCurrency(dto: CreateCurrencyDto): Promise<{
        symbol: string;
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        decimals: number;
    }>;
}
