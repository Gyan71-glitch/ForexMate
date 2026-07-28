import { PrismaService } from '../../prisma/prisma.service';
export declare class DevSystemService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSystemHealth(): Promise<{
        backend: string;
        database: string;
        redis: string;
        fastforex: string;
        razorpay: string;
        queue: string;
        storage: string;
        cronJobs: string;
        mail: string;
        sms: string;
    }>;
    getPerformanceMetrics(): Promise<{
        cpuUsageUser: string;
        cpuUsageSystem: string;
        heapTotal: string;
        heapUsed: string;
        rss: string;
        external: string;
        activeDbConnections: number;
        queueDepth: number;
        deadLetterQueue: number;
        cacheHitRate: string;
        eventThroughput: string;
    }>;
    injectError(flagName: string, state: boolean): Promise<{
        success: boolean;
        flags: any;
    }>;
    getInjectedErrors(): Promise<any>;
    setFeatureFlag(flagName: string, state: boolean): Promise<{
        success: boolean;
        flags: any;
    }>;
    getFeatureFlags(): Promise<any>;
    setMockTime(dateStr: string | null): Promise<{
        success: boolean;
        mockTime: any;
    }>;
    getMockTime(): Promise<{
        mockTime: any;
    }>;
    getQueueData(): Promise<{
        counts: {
            PENDING: number;
            FAILED: number;
            PROCESSED: number;
        };
        recent: {
            id: string;
            createdAt: Date;
            status: string;
            recipient: string;
            channel: string;
            subject: string | null;
            body: string;
            attempts: number;
            processedAt: Date | null;
            priority: string;
        }[];
        isPaused: any;
    }>;
    executeQueueAction(action: string): Promise<{
        success: boolean;
        action: "RETRY_FAILED" | "PAUSE" | "RESUME" | "CLEAR_DLQ" | "REPROCESS_EMAILS";
    }>;
    getTableRows(table: string): Promise<any>;
}
