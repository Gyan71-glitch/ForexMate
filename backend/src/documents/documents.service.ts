import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: {
        order: {
          profile: {
            userId
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
                currency: true
              }
            }
          }
        },
        items: true,
        receipts: true
      }
    });
  }

  async getInvoiceById(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        order: {
          profile: {
            userId
          }
        }
      },
      include: {
        order: {
          include: {
            profile: true,
            branch: true,
            items: {
              include: {
                product: true,
                currency: true
              }
            }
          }
        },
        items: true,
        receipts: true
      }
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async getReceipts(userId: string) {
    return this.prisma.invoiceReceipt.findMany({
      where: {
        invoice: {
          order: {
            profile: {
              userId
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          include: {
            order: {
              include: {
                items: {
                  include: {
                    currency: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }
}
