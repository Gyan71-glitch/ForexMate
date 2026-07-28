import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { FastForexAdapter } from './providers/fastforex.adapter';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';

@Injectable()
export class RatesService implements OnModuleInit {
  private readonly logger = new Logger(RatesService.name);

  constructor(
    private prisma: PrismaService,
    private readonly fastForexAdapter: FastForexAdapter,
    private readonly eventBus: DomainEventBus
  ) {}

  async onModuleInit() {
    this.fetchAndSaveRates();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Cron triggered: Fetching live exchange rates from FastForex...');
    await this.fetchAndSaveRates();
  }

  /**
   * The core Pricing Engine method.
   * Gets inter-bank rates from adapter, applies dynamic DB margins, and saves the final customer quote.
   * Uses executeWithReconnect() to automatically recover from Neon serverless idle connection drops.
   */
  async fetchAndSaveRates() {
    try {
      const liveRates = await this.fastForexAdapter.fetchLiveRates();

      // Use executeWithReconnect to handle Neon serverless idle connection drops
      const dbCurrenciesList = await this.prisma.executeWithReconnect(() =>
        this.prisma.currency.findMany({})
      );
      const currencyMap: Record<string, string> = {};
      for (const c of dbCurrenciesList) {
        currencyMap[c.code] = c.id;
      }

      // Fetch dynamic margins from MDM Layer
      const retailMarginRule = await this.prisma.executeWithReconnect(() =>
        this.prisma.exchangeRateMarginRule.findFirst({
          where: { segment: 'RETAIL' }
        })
      );
      const margin = retailMarginRule?.marginPct || 0.01; // Default 1% margin

      const upserts: any[] = [];
      for (const [currencyCode, interbankRateInr] of Object.entries(liveRates)) {
        const currencyId = currencyMap[currencyCode];
        if (!currencyId) continue;

        // Pricing Engine Math:
        // If USD interbank is 83.50, Bank buys for 82.66 (1% less) and sells for 84.33 (1% more)
        const buyRate = +(interbankRateInr * (1 - margin)).toFixed(4);
        const sellRate = +(interbankRateInr * (1 + margin)).toFixed(4);

        upserts.push(
          this.prisma.exchangeRate.upsert({
            where: { currencyId },
            update: {
              inrRate: interbankRateInr,
              marginBuyPct: margin,
              marginSellPct: margin,
            },
            create: {
              currencyId,
              inrRate: interbankRateInr,
              marginBuyPct: margin,
              marginSellPct: margin,
            },
          })
        );
      }

      // Also upsert INR = 1 (Base Currency)
      const inrCurrencyId = currencyMap['INR'];
      if (inrCurrencyId) {
        upserts.push(
          this.prisma.exchangeRate.upsert({
            where: { currencyId: inrCurrencyId },
            update: { inrRate: 1, marginBuyPct: 0, marginSellPct: 0 },
            create: { currencyId: inrCurrencyId, inrRate: 1, marginBuyPct: 0, marginSellPct: 0 },
          })
        );
      }

      if (upserts.length === 0) return;

      // Wrap the bulk upsert transaction with executeWithReconnect
      await this.prisma.executeWithReconnect(async () => {
        await this.prisma.$transaction(upserts);
      });

      this.logger.log(`Pricing Engine: Updated ${upserts.length} currency quotes.`);
    } catch (error: any) {
      this.logger.error(`Pricing Engine Failed: \n${error.message}`);
    }
  }

  async getAllRates() {
    return this.prisma.exchangeRate.findMany({
      include: { currency: true },
    });
  }

  async updateRate(id: string, inrRate: number, marginBuyPct: number, marginSellPct: number) {
    const rate = await this.prisma.exchangeRate.update({
      where: { id },
      data: {
        inrRate,
        marginBuyPct,
        marginSellPct
      },
      include: { currency: true }
    });

    // Write to history
    await this.prisma.exchangeRateHistory.create({
      data: {
        currencyId: rate.currencyId,
        inrRate
      }
    });

    // Publish event
    this.eventBus.publish('LiveRatesUpdated', { rateId: id, inrRate, buyMargin: marginBuyPct });

    return rate;
  }

  async getProducts() {
    return this.prisma.forexProduct.findMany({});
  }

  async updateProduct(id: string, isActive: boolean) {
    return this.prisma.forexProduct.update({
      where: { id },
      data: { isActive }
    });
  }
}
