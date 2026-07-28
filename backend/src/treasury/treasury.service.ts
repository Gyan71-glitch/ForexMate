import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TreasuryService {
  private readonly logger = new Logger(TreasuryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs a trade with another bank (e.g., buying 100,000 USD from HDFC)
   * Updates the dealer's Net Open Position.
   */
  async executeInterbankTrade(currencyCode: string, tradeType: 'BUY' | 'SELL', amount: number, rate: number, bankName: string) {
    const currency = await this.prisma.currency.findUnique({ where: { code: currencyCode } });
    if (!currency) throw new BadRequestException(`Currency ${currencyCode} not found`);

    return this.prisma.$transaction(async (tx) => {
      // 1. Record the trade
      const trade = await tx.interbankTrade.create({
        data: {
          currencyId: currency.id,
          tradeType,
          amount,
          rate,
          bankName,
        }
      });

      // 2. Update Dealer Position
      let position = await tx.dealerPosition.findUnique({ where: { currencyId: currency.id } });
      
      if (!position) {
        position = await tx.dealerPosition.create({
          data: { currencyId: currency.id }
        });
      }

      const amountDecimal = Number(amount);
      const isBuy = tradeType === 'BUY';

      // Very simplified position math for MVP
      const totalBought = Number(position.totalBought) + (isBuy ? amountDecimal : 0);
      const totalSold = Number(position.totalSold) + (isBuy ? 0 : amountDecimal);
      const netOpenPosition = totalBought - totalSold;

      await tx.dealerPosition.update({
        where: { id: position.id },
        data: {
          totalBought,
          totalSold,
          netOpenPosition
        }
      });

      this.logger.log(`Executed Interbank ${tradeType} for ${amount} ${currencyCode} with ${bankName}`);
      return trade;
    });
  }

  /**
   * Get live dealer positions for the dashboard.
   */
  async getDealerPositions() {
    return this.prisma.dealerPosition.findMany({
      include: { currency: true }
    });
  }
}
