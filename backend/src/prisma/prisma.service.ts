import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Set WebSocket constructor for Neon serverless pool (runs over WSS / port 443)
// This bypasses port 5432 blocks while fully supporting interactive transactions ($transaction)
neonConfig.webSocketConstructor = ws;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);

    super({ adapter } as any);
  }

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('✅ Database connection established (via Neon WebSocket over Port 443).');
        return;
      } catch (error: any) {
        retries--;
        this.logger.warn(
          `⚠️  Database connection failed (${5 - retries}/5): ${error.message}. Retrying in 3s...`,
        );
        if (retries === 0) {
          this.logger.error('❌ Could not connect to the database after 5 retries.');
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Executes a database operation with automatic reconnection on stale connection errors.
   * Use this as a wrapper for any critical DB operations in cron jobs or background tasks.
   */
  async executeWithReconnect<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        const isConnectionError =
          error.message?.includes("Can't reach database server") ||
          error.message?.includes('Server has closed the connection') ||
          error.message?.includes('connection reset') ||
          error.message?.includes('socket hang up') ||
          error.code === 'P1001' ||
          error.code === 'P1002' ||
          error.code === 'P1008';

        if (isConnectionError && attempt < retries) {
          this.logger.warn(
            `🔄 DB connection error (attempt ${attempt}/${retries}), reconnecting... Error: ${error.message}`,
          );
          try {
            await this.$disconnect();
          } catch {}
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          try {
            await this.$connect();
          } catch (reconnErr: any) {
            this.logger.warn(`Reconnect attempt failed: ${reconnErr.message}`);
          }
          continue;
        }
        throw error;
      }
    }
    throw new Error('executeWithReconnect: exhausted all retries');
  }
}
