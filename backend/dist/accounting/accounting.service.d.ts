import { PrismaService } from '../prisma/prisma.service';
import { CreateLedgerDto, CreateJournalEntryDto } from './dto/accounting.dto';
export declare class AccountingService {
  private prisma;
  constructor(prisma: PrismaService);
  createLedger(dto: CreateLedgerDto): Promise<{
    id: string;
    updatedAt: Date;
    balance: import('@prisma/client/runtime/library').Decimal;
    accountName: string;
  }>;
  getLedgers(): Promise<
    {
      id: string;
      updatedAt: Date;
      balance: import('@prisma/client/runtime/library').Decimal;
      accountName: string;
    }[]
  >;
  createJournalEntry(dto: CreateJournalEntryDto): Promise<{
    id: string;
    createdAt: Date;
    description: string;
    type: string;
    amount: import('@prisma/client/runtime/library').Decimal;
    ledgerId: string;
  }>;
  getJournals(): Promise<
    ({
      ledger: {
        accountName: string;
      };
    } & {
      id: string;
      createdAt: Date;
      description: string;
      type: string;
      amount: import('@prisma/client/runtime/library').Decimal;
      ledgerId: string;
    })[]
  >;
}
