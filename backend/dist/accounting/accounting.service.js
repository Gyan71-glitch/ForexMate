'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AccountingService = void 0;
const common_1 = require('@nestjs/common');
const prisma_service_1 = require('../prisma/prisma.service');
let AccountingService = class AccountingService {
  prisma;
  constructor(prisma) {
    this.prisma = prisma;
  }
  async createLedger(dto) {
    const existing = await this.prisma.generalLedger.findUnique({
      where: { accountName: dto.accountName },
    });
    if (existing) {
      throw new common_1.BadRequestException(
        'Ledger account name already exists',
      );
    }
    return this.prisma.generalLedger.create({
      data: {
        accountName: dto.accountName,
        balance: 0.0,
      },
    });
  }
  async getLedgers() {
    return this.prisma.generalLedger.findMany({
      orderBy: { accountName: 'asc' },
    });
  }
  async createJournalEntry(dto) {
    const ledger = await this.prisma.generalLedger.findUnique({
      where: { id: dto.ledgerId },
    });
    if (!ledger) {
      throw new common_1.NotFoundException('General Ledger not found');
    }
    return this.prisma.$transaction(async (tx) => {
      const journal = await tx.journalEntry.create({
        data: {
          ledgerId: dto.ledgerId,
          type: dto.type,
          amount: dto.amount,
          description: dto.description,
        },
      });
      const multiplier = dto.type === 'CREDIT' ? 1 : -1;
      await tx.generalLedger.update({
        where: { id: dto.ledgerId },
        data: {
          balance: {
            increment: dto.amount * multiplier,
          },
        },
      });
      return journal;
    });
  }
  async getJournals() {
    return this.prisma.journalEntry.findMany({
      include: {
        ledger: {
          select: { accountName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [prisma_service_1.PrismaService]),
  ],
  AccountingService,
);
//# sourceMappingURL=accounting.service.js.map
