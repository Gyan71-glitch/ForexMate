import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLedgerDto, CreateJournalEntryDto } from './dto/accounting.dto';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async createLedger(dto: CreateLedgerDto) {
    const existing = await this.prisma.generalLedger.findUnique({
      where: { accountName: dto.accountName }
    });

    if (existing) {
      throw new BadRequestException('Ledger account name already exists');
    }

    return this.prisma.generalLedger.create({
      data: {
        accountName: dto.accountName,
        balance: 0.00
      }
    });
  }

  async getLedgers() {
    return this.prisma.generalLedger.findMany({
      orderBy: { accountName: 'asc' }
    });
  }

  async createJournalEntry(dto: CreateJournalEntryDto) {
    const ledger = await this.prisma.generalLedger.findUnique({
      where: { id: dto.ledgerId }
    });

    if (!ledger) {
      throw new NotFoundException('General Ledger not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create journal entry
      const journal = await tx.journalEntry.create({
        data: {
          ledgerId: dto.ledgerId,
          type: dto.type,
          amount: dto.amount,
          description: dto.description
        }
      });

      // Update Ledger Balance
      // Assume CREDIT increases balance, DEBIT decreases (normal for equity/revenue/liability)
      // Or vice versa depending on accounting rules. Let's just do a simple absolute addition/subtraction.
      const multiplier = dto.type === 'CREDIT' ? 1 : -1;
      
      await tx.generalLedger.update({
        where: { id: dto.ledgerId },
        data: {
          balance: {
            increment: dto.amount * multiplier
          }
        }
      });

      return journal;
    });
  }

  async getJournals() {
    return this.prisma.journalEntry.findMany({
      include: {
        ledger: {
          select: { accountName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
