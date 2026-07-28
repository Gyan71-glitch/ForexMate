import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuoteDto } from './dto/quote.dto';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateQuote(userId: string, dto: GenerateQuoteDto) {
    // Validate branchId exists if provided
    if (dto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branch) {
        throw new BadRequestException(`Branch with id '${dto.branchId}' not found`);
      }
    }

    const currency = await this.prisma.currency.findUnique({

      where: { code: dto.currency },
      include: { rates: true }
    });

    if (!currency || !currency.rates) {
      throw new BadRequestException(`No active exchange rate for currency ${dto.currency}`);
    }

    const exchangeRate = currency.rates;
    const baseRate = exchangeRate.inrRate;

    // Sell rate logic: User buys foreign currency, bank sells.
    let margin = 0;
    let rate = baseRate;
    let lockedRate = rate;

    if (dto.product === 'CASH_SELL') {
      margin = exchangeRate.marginSellPct + 0.005; // Base sell margin + cash premium
      rate = baseRate * (1 - margin);
      // For cash sell, we pay the customer less than base rate, and locking it secures the bank from drops.
      lockedRate = rate * 0.99;
    } else {
      if (dto.product === 'CASH') margin = exchangeRate.marginBuyPct + 0.005; // Base margin + cash premium
      if (dto.product === 'CARD') margin = exchangeRate.marginBuyPct;
      if (dto.product === 'REMITTANCE') margin = exchangeRate.marginBuyPct - 0.002; // Better rate for wire
      rate = baseRate * (1 + margin);
      // Add a 1% margin for the quote to make sure user pays more
      lockedRate = rate * 1.01;
    }

    let profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      profile = await this.prisma.customerProfile.create({
        data: { userId }
      });
    }
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const quoteNumber = `QTE-${Math.floor(100000 + Math.random() * 900000)}`;

    const quote = await this.prisma.quote.create({
      data: {
        quoteNumber,
        profileId: profile.id,
        sessionId: dto.sessionId || null,
        currencyId: currency.id,
        lockedInrRate: lockedRate,
        amountForeign: dto.amount,
        expiresAt,
        status: 'ACTIVE'
      }
    });

    this.logger.log(`Generated Quote ${quote.quoteNumber} for profile ${profile.id} in session ${dto.sessionId}`);

    return {
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      currency: dto.currency,
      lockedInrRate: Number(lockedRate.toFixed(4)),
      amountForeign: dto.amount,
      totalInr: Number((lockedRate * dto.amount).toFixed(2)),
      expiresAt,
      timeRemainingMinutes: 15
    };
  }
}
