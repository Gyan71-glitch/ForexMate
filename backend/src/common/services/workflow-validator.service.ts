import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Order } from '@prisma/client';

@Injectable()
export class WorkflowValidatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Centralized backend workflow state transition validator.
   */
  async validateTransition(orderId: string, action: string): Promise<Order> {
    const order = (await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        profile: {
          include: {
            user: {
              include: { KycDocument: true }
            }
          }
        },
        payments: true,
        tasks: true,
      }
    })) as any;

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const docs = order.profile?.user?.KycDocument || [];
    const kycApproved = order.complianceStatus === 'APPROVED' || order.profile?.kycOverallStatus === 'VERIFIED';
    const isPaid = order.status === 'PAYMENT_COMPLETED' || order.payments?.some((p: any) => p.status === 'SUCCESS');

    switch (action) {
      case 'APPROVE_KYC':
        // Can only approve KYC if documents have been uploaded
        if (docs.length === 0) {
          throw new BadRequestException('Cannot approve KYC: No compliance documents uploaded.');
        }
        break;

      case 'REJECT_KYC':
        // Can only reject KYC if documents have been uploaded
        if (docs.length === 0) {
          throw new BadRequestException('Cannot reject KYC: No compliance documents uploaded.');
        }
        break;

      case 'RESERVE_CURRENCY':
        // Can only reserve currency if KYC is approved
        if (!kycApproved) {
          throw new BadRequestException('Cannot reserve inventory: KYC is not yet approved.');
        }
        break;

      case 'MARK_READY':
        // Can only mark ready if KYC is approved and currency is reserved
        if (!kycApproved) {
          throw new BadRequestException('Cannot mark ready: KYC is not yet approved.');
        }
        const inventoryTask = order.tasks?.find((t: any) => t.taskType === 'INVENTORY_PREP');
        if (inventoryTask && inventoryTask.status !== 'COMPLETED') {
          throw new BadRequestException('Cannot mark ready: Inventory has not been confirmed/reserved.');
        }
        break;

      case 'COMPLETE_HANDOVER':
        // Can only complete handover if order is paid, KYC is approved, and inventory is prepared
        if (!kycApproved) {
          throw new BadRequestException('Cannot complete handover: KYC is not yet approved.');
        }
        if (!isPaid) {
          throw new BadRequestException('Cannot complete handover: Order payment is pending.');
        }
        const prepTask = order.tasks?.find((t: any) => t.taskType === 'INVENTORY_PREP');
        if (prepTask && prepTask.status !== 'COMPLETED') {
          throw new BadRequestException('Cannot complete handover: Inventory prep task is not completed.');
        }
        break;

      default:
        // Other non-state transitions (e.g. notes) don't trigger validation locks
        break;
    }

    return order;
  }
}
