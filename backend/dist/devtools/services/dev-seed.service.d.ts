import { PrismaService } from '../../prisma/prisma.service';
export declare class DevSeedService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    factoryReset(confirmation: string): Promise<{
        success: boolean;
        message: string;
        backupFile: string;
        health: {
            healthy: boolean;
            errors: string[];
            counts: {
                roles: number;
                branches: number;
                currencies: number;
                vaults: number;
                ticketCategories: number;
            };
        };
    }>;
    seedProfile(profileName: string): Promise<{
        success: boolean;
        profile: "EMPTY";
        seeded: {};
    } | {
        success: boolean;
        profile: "SMALL_STARTUP" | "MEDIUM_BUSINESS" | "LARGE_ENTERPRISE" | "STRESS_TEST" | "DEMO_DAY" | "CONFERENCE_DEMO";
        seeded: any;
    }>;
    runHealthChecks(): Promise<{
        healthy: boolean;
        errors: string[];
        counts: {
            roles: number;
            branches: number;
            currencies: number;
            vaults: number;
            ticketCategories: number;
        };
    }>;
    private backupDatabase;
    private clearDatabase;
    private seedBaseData;
    private generateMockEntities;
}
