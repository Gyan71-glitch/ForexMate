import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface IntegrityIssue {
  type: string;
  severity: 'WARNING' | 'CRITICAL';
  entityId: string;
  message: string;
}

@Injectable()
export class IntegrityCheckerService {
  private readonly logger = new Logger(IntegrityCheckerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs validation checks across order states, payments, invoices, tasks, and vaults.
   */
  async runIntegrityChecks(): Promise<{ healthy: boolean; issues: IntegrityIssue[] }> {
    const issues: IntegrityIssue[] = [];

    // 1. Check for paid orders with missing Invoices/Receipts
    const paidOrders = await this.prisma.order.findMany({
      where: { status: { in: ['PAYMENT_COMPLETED', 'COMPLETED', 'DELIVERED'] } },
      include: { invoices: { include: { receipts: true } }, payments: true }
    });

    for (const order of paidOrders) {
      const hasSuccessPayment = order.payments.some(p => p.status === 'SUCCESS');
      if (!hasSuccessPayment) {
        issues.push({
          type: 'MISSING_PAYMENT_RECORD',
          severity: 'CRITICAL',
          entityId: order.id,
          message: `Order ${order.orderNumber} is marked paid, but has no SUCCESS payment record.`,
        });
      }

      if (order.invoices.length === 0) {
        issues.push({
          type: 'MISSING_INVOICE',
          severity: 'WARNING',
          entityId: order.id,
          message: `Order ${order.orderNumber} is paid but has no Invoice generated in the database.`,
        });
      } else {
        const invoice = order.invoices[0];
        if (invoice.receipts.length === 0) {
          issues.push({
            type: 'MISSING_RECEIPT',
            severity: 'WARNING',
            entityId: order.id,
            message: `Order ${order.orderNumber} has an invoice, but lacks an InvoiceReceipt.`,
          });
        }
      }
    }

    // 2. Check for negative branch vault stock balances
    const vaults = await this.prisma.branchVault.findMany({});
    for (const vault of vaults) {
      if (vault.totalAmount.toNumber() < 0) {
        issues.push({
          type: 'NEGATIVE_VAULT_BALANCE',
          severity: 'CRITICAL',
          entityId: vault.id,
          message: `Branch Vault ${vault.id} has a negative balance of ${vault.totalAmount}.`,
        });
      }
    }

    // 3. Check for active orders with missing workflow tasks
    const activeOrders = await this.prisma.order.findMany({
      where: { status: { notIn: ['CANCELLED', 'REJECTED'] } },
      include: { tasks: true }
    });

    for (const order of activeOrders) {
      if (order.requiresKyc && !order.tasks.some(t => t.taskType === 'KYC_REVIEW')) {
        issues.push({
          type: 'MISSING_KYC_TASK',
          severity: 'CRITICAL',
          entityId: order.id,
          message: `Order ${order.orderNumber} requires KYC but has no KYC_REVIEW task in the branch queue.`,
        });
      }
      if (order.requiresInventory && !order.tasks.some(t => t.taskType === 'INVENTORY_PREP')) {
        issues.push({
          type: 'MISSING_INVENTORY_TASK',
          severity: 'CRITICAL',
          entityId: order.id,
          message: `Order ${order.orderNumber} requires inventory prep but has no INVENTORY_PREP task.`,
        });
      }
    }

    this.logger.log(`Integrity Check finished. Healthy: ${issues.length === 0}. Found ${issues.length} issues.`);

    return {
      healthy: issues.length === 0,
      issues,
    };
  }
}
