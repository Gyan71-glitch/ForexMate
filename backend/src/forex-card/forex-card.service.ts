import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ForexCardService {
  constructor(private prisma: PrismaService) {}

  async applyForCard(userId: string, currencyId: string, balance: number) {
    return this.prisma.forexCard.create({
      data: {
        cardNumber: `FXC-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        cardVendor: 'VISA',
        userId,
      },
    });
  }

  async getUserCards(userId: string) {
    return this.prisma.forexCard.findMany({
      where: { userId },
      include: {
        wallets: {
          include: {
            currency: true,
          },
          orderBy: { balance: 'desc' },
        },
        provider: true,
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            currency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCardById(cardId: string, userId: string) {
    const card = await this.prisma.forexCard.findFirst({
      where: { id: cardId, userId },
      include: {
        wallets: {
          include: { currency: true },
          orderBy: { balance: 'desc' },
        },
        provider: true,
        transactions: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: { currency: true },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(`Card not found`);
    }

    return card;
  }

  async getAllTransactions(userId: string) {
    return this.prisma.cardTransaction.findMany({
      where: {
        card: { userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        currency: true,
        card: {
          select: { cardNumber: true, cardVendor: true },
        },
      },
    });
  }

  async freezeCard(cardId: string, userId: string) {
    const card = await this.prisma.forexCard.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new ForbiddenException('Card not found or not owned by you');
    return this.prisma.forexCard.update({
      where: { id: cardId },
      data: { cardStatus: 'BLOCKED' },
    });
  }

  async unfreezeCard(cardId: string, userId: string) {
    const card = await this.prisma.forexCard.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new ForbiddenException('Card not found or not owned by you');
    return this.prisma.forexCard.update({
      where: { id: cardId },
      data: { cardStatus: 'ACTIVE' },
    });
  }

  async reloadCard(cardId: string, userId: string, currencyId: string, amount: number) {
    const card = await this.prisma.forexCard.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new ForbiddenException('Card not found or not owned by you');

    // Upsert wallet balance
    return this.prisma.cardWallet.upsert({
      where: { cardId_currencyId: { cardId, currencyId } },
      create: { cardId, currencyId, balance: amount },
      update: { balance: { increment: amount } },
    });
  }
}
