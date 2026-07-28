import { PrismaService } from '../../prisma/prisma.service';
export interface IntegrityIssue {
    type: string;
    severity: 'WARNING' | 'CRITICAL';
    entityId: string;
    message: string;
}
export declare class IntegrityCheckerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    runIntegrityChecks(): Promise<{
        healthy: boolean;
        issues: IntegrityIssue[];
    }>;
}
