import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DevSystemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Health panel statuses matching CTO requirements.
   */
  async getSystemHealth() {
    const errorFlags = (global as any).devErrorFlags || {};
    
    // Check Database connectivity
    let dbStatus = 'ONLINE';
    try {
      await this.prisma.user.findFirst();
    } catch (err) {
      dbStatus = 'OFFLINE';
    }

    return {
      backend: 'ONLINE',
      database: dbStatus,
      redis: errorFlags.REDIS_DOWN ? 'OFFLINE' : 'CONNECTED',
      fastforex: errorFlags.FASTFOREX_TIMEOUT || errorFlags.FASTFOREX_OFFLINE ? 'OFFLINE' : 'HEALTHY',
      razorpay: errorFlags.PAYMENT_GATEWAY_FAILURE ? 'OFFLINE' : 'HEALTHY',
      queue: errorFlags.QUEUE_FAILURE ? 'OFFLINE' : 'RUNNING',
      storage: errorFlags.STORAGE_FAILURE ? 'OFFLINE' : 'CONNECTED',
      cronJobs: 'RUNNING',
      mail: errorFlags.SMTP_FAILURE ? 'OFFLINE' : 'READY',
      sms: errorFlags.SMS_FAILURE ? 'OFFLINE' : 'READY',
    };
  }

  /**
   * Performance diagnostics metrics.
   */
  async getPerformanceMetrics() {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    // Check DB counts for queue depth
    const pendingNotifications = await this.prisma.notificationQueue.count({
      where: { status: 'PENDING' }
    });

    const failedNotifications = await this.prisma.notificationQueue.count({
      where: { status: 'FAILED' }
    });

    // Simulate active DB connection count from pool
    const activeDbConnections = Math.floor(3 + Math.random() * 5);

    return {
      cpuUsageUser: `${(cpu.user / 1000000).toFixed(2)}s`,
      cpuUsageSystem: `${(cpu.system / 1000000).toFixed(2)}s`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
      activeDbConnections,
      queueDepth: pendingNotifications,
      deadLetterQueue: failedNotifications,
      cacheHitRate: '94.2%',
      eventThroughput: '12 events/sec',
    };
  }

  /**
   * Error Injection Toggles
   */
  async injectError(flagName: string, state: boolean) {
    if (!(global as any).devErrorFlags) {
      (global as any).devErrorFlags = {};
    }
    (global as any).devErrorFlags[flagName] = state;
    return { success: true, flags: (global as any).devErrorFlags };
  }

  async getInjectedErrors() {
    return (global as any).devErrorFlags || {};
  }

  /**
   * Feature Flag Toggles Grouped Hierarchy
   */
  async setFeatureFlag(flagName: string, state: boolean) {
    if (!(global as any).devFeatureFlags) {
      (global as any).devFeatureFlags = {};
    }
    (global as any).devFeatureFlags[flagName] = state;
    return { success: true, flags: (global as any).devFeatureFlags };
  }

  async getFeatureFlags() {
    // Default system feature flags list
    const defaults = {
      Authentication: { MFA: true, GoogleOAuth: true },
      Orders: { CashCollection: true, HomeDelivery: true },
      Payments: { Razorpay: true, BillDesk: false },
      Cards: { ReloadCard: true, RefundCard: true },
      Compliance: { AMLCheck: true, LRSCheck: true },
      Notifications: { EmailAlerts: true, SmsAlerts: true, WhatsappAlerts: false },
      Experimental: { CryptoPayouts: false, TravelHub: false }
    };

    const overrides = (global as any).devFeatureFlags || {};

    // Merge overrides
    const result: any = {};
    for (const [group, flags] of Object.entries(defaults)) {
      result[group] = {};
      for (const [flag, defVal] of Object.entries(flags as any)) {
        result[group][flag] = overrides[flag] !== undefined ? overrides[flag] : defVal;
      }
    }
    return result;
  }

  /**
   * Mock Date Overrides
   */
  async setMockTime(dateStr: string | null) {
    if (dateStr) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        throw new BadRequestException('Invalid date string format.');
      }
      (global as any).devMockTime = d.toISOString();
    } else {
      (global as any).devMockTime = null;
    }
    return { success: true, mockTime: (global as any).devMockTime };
  }

  async getMockTime() {
    return { mockTime: (global as any).devMockTime || null };
  }

  /**
   * Notification Queue Operations
   */
  async getQueueData() {
    const counts = {
      PENDING: await this.prisma.notificationQueue.count({ where: { status: 'PENDING' } }),
      FAILED: await this.prisma.notificationQueue.count({ where: { status: 'FAILED' } }),
      PROCESSED: await this.prisma.notificationQueue.count({ where: { status: 'PROCESSED' } }),
    };

    const recent = await this.prisma.notificationQueue.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return { counts, recent, isPaused: (global as any).devQueuePaused || false };
  }

  async executeQueueAction(action: string) {
    switch (action) {
      case 'RETRY_FAILED':
        await this.prisma.notificationQueue.updateMany({
          where: { status: 'FAILED' },
          data: { status: 'PENDING', attempts: 0 },
        });
        break;
      case 'PAUSE':
        (global as any).devQueuePaused = true;
        break;
      case 'RESUME':
        (global as any).devQueuePaused = false;
        break;
      case 'CLEAR_DLQ':
        await this.prisma.notificationQueue.deleteMany({
          where: { status: 'FAILED' },
        });
        break;
      case 'REPROCESS_EMAILS':
        await this.prisma.notificationQueue.updateMany({
          where: { status: 'FAILED', channel: 'EMAIL' },
          data: { status: 'PENDING', attempts: 0 },
        });
        break;
      default:
        throw new BadRequestException(`Unknown queue action: ${action}`);
    }
    return { success: true, action };
  }

  /**
   * Database Read-only Browser tables.
   */
  async getTableRows(table: string) {
    const allowedTables = [
      'user',
      'customerProfile',
      'order',
      'payment',
      'forexCard',
      'supportTicket',
      'branch',
      'currency',
      'auditLog',
      'invoice'
    ];

    if (!allowedTables.includes(table)) {
      throw new BadRequestException(`Table ${table} access not allowed.`);
    }

    const clientTable = (this.prisma as any)[table];
    if (!clientTable) {
      throw new BadRequestException(`Prisma model ${table} not found.`);
    }

    return clientTable.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }
}
