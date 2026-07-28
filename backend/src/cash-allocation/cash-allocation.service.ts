import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CashAllocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: DomainEventBus,
  ) {}

  async createAllocation(
    userId: string,
    userRole: string,
    orderId: string,
    items: { denomination: number; quantity: number }[],
  ) {
    // 1. Fetch order details with validation
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            currency: true,
          },
        },
        cashAllocation: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    console.log(`[CashAllocation] DEBUG Fetching order ${orderId}`);
    console.log(`[CashAllocation] DEBUG Returned Order:`, JSON.stringify(order, null, 2));

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      throw new BadRequestException('Cannot allocate cash for a cancelled or rejected order');
    }

    // 2. Access Control: Branch Manager, Super Admin, Ops Admin, or assigned staff
    const isAssigned = order.assignedStaffId === userId;
    const isManager = userRole === 'BRANCH_MANAGER' || !userRole;
    const isSuper = userRole === 'SUPER_ADMIN';
    const isOpsAdmin = userRole === 'OPERATIONS_ADMIN';

    // Cash allocation is now a Branch Manager responsibility
    // Any Branch Manager can allocate cash for orders assigned to their branch

    if (order.cashAllocation) {
      throw new BadRequestException('Cash allocation has already been submitted for this order.');
    }

    // 3. Validation: Allocate total must equal order currency amount
    const orderItem = order.items[0];
    if (!orderItem) {
      throw new BadRequestException('Order does not contain items.');
    }

    const currencyCode = orderItem.currency.code;
    const orderAmount = Number(orderItem.amount);

    let totalAllocated = 0;
    const allocationItemsData: { denomination: number; quantity: number; amount: number }[] = [];

    for (const item of items) {
      if (item.denomination <= 0 || item.quantity <= 0) {
        throw new BadRequestException('Denomination and quantity must be positive integers.');
      }
      const lineAmount = item.denomination * item.quantity;
      totalAllocated += lineAmount;
      allocationItemsData.push({
        denomination: item.denomination,
        quantity: item.quantity,
        amount: lineAmount,
      });
    }

    if (Math.abs(totalAllocated - orderAmount) > 0.0001) {
      throw new BadRequestException(`Allocated total (${totalAllocated} ${currencyCode}) must exactly equal the order amount (${orderAmount} ${currencyCode}).`);
    }

    // 4. Retrieve and lock vault stock in a transaction
    console.log(`[CashAllocation] Starting transaction for order ${order.id}...`);
    try {
      return await this.prisma.$transaction(async (tx) => {
        console.log(`[CashAllocation] Inside transaction, finding vault...`);
      // Find branch vault for the currency
      const vault = await tx.branchVault.findFirst({
        where: { branchId: order.branchId, currencyId: orderItem.currencyId },
        include: { denominations: true },
      });

      if (!vault) {
        console.error(`[CashAllocation] No vault found for ${currencyCode}`);
        throw new BadRequestException(`No branch vault provisioned for currency ${currencyCode}`);
      }

      console.log(`[CashAllocation] Checking stock availability...`);
      // Check stock availability & deduct reserved notes
      for (const item of allocationItemsData) {
        const vaultDenom = vault.denominations.find(d => d.denomination === item.denomination);
        if (!vaultDenom || vaultDenom.noteCount < item.quantity) {
          const available = vaultDenom ? vaultDenom.noteCount : 0;
          throw new BadRequestException(
            `Insufficient vault stock for ${item.denomination} ${currencyCode} notes. Requested: ${item.quantity}, Available: ${available}`,
          );
        }

        // Reserve notes at denomination level (decrement available noteCount)
        console.log(`[CashAllocation] Reserving notes for denomination ${item.denomination}...`);
        await tx.vaultDenomination.update({
          where: { id: vaultDenom.id },
          data: { noteCount: { decrement: item.quantity } },
        });
      }

      console.log(`[CashAllocation] Creating CashAllocation record...`);
      // Create parent CashAllocation
      const allocation = await tx.cashAllocation.create({
        data: {
          orderId: order.id,
          branchId: order.branchId,
          currencyCode,
          allocatedAmount: totalAllocated,
          allocatedBy: userId,
          status: 'LOCKED',
          items: {
            create: allocationItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Create active Vault Reservation
      const reservation = await tx.inventoryReservation.create({
        data: {
          branchId: order.branchId,
          orderId: order.id,
          currencyCode,
          amount: totalAllocated,
          status: 'ACTIVE',
        },
      });

      console.log(`[CashAllocation] Creating VaultTransaction log...`);
      // Create Vault Transaction log (RESERVE)
      await tx.vaultTransaction.create({
        data: {
          vaultId: vault.id,
          type: 'RESERVE',
          amount: totalAllocated,
        },
      });

      // Create Inventory Movement log (RESERVATION)
      await tx.inventoryMovement.create({
        data: {
          branchId: order.branchId,
          currencyCode,
          amount: totalAllocated,
          direction: 'OUT',
          movementType: 'RESERVATION',
          referenceId: order.id,
        },
      });

      // Update Order stage to FULFILLMENT_STAGE (or complete inventory task)
      await tx.order.update({
        where: { id: order.id },
        data: {
          currentStage: 'FULFILLMENT_STAGE',
        },
      });

      // Complete the INVENTORY_PREP branch task if exists
      console.log(`[CashAllocation] Completing INVENTORY_PREP task...`);
      const inventoryTask = await tx.branchTask.findFirst({
        where: { orderId: order.id, taskType: 'INVENTORY_PREP', status: { not: 'COMPLETED' } },
      });
      if (inventoryTask) {
        await tx.branchTask.update({
          where: { id: inventoryTask.id },
          data: {
            status: 'COMPLETED',
            resolvedByUserId: userId,
            notes: 'Cash allocation completed and vault notes reserved.',
          },
        });
      }

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'ALLOCATED_CASH',
          entityName: 'Order',
          entityId: order.id,
          newData: {
            allocationId: allocation.id,
            totalAllocated,
            currencyCode,
          },
          branchId: order.branchId,
        },
      });

      console.log(`[CashAllocation] Publishing events...`);
      // Publish events on domain event bus
      this.eventBus.publish('CashAllocated', {
        orderId: order.id,
        allocationId: allocation.id,
        branchId: order.branchId,
        currencyCode,
        amount: totalAllocated,
        userId,
      });

      this.eventBus.publish('ReservationCreated', {
        orderId: order.id,
        reservationId: reservation.id,
        branchId: order.branchId,
        currencyCode,
        amount: totalAllocated,
      });

      console.log(`[CashAllocation] Transaction complete.`);
      return allocation;
    });
    } catch (e) {
      throw new BadRequestException(`CASH_ALLOCATION_FAIL: ${e.message}`);
    }
  }

  async getAllocation(orderId: string) {
    const allocation = await this.prisma.cashAllocation.findUnique({
      where: { orderId },
      include: {
        items: true,
      },
    });

    if (!allocation) {
      return null;
    }
    return allocation;
  }
}
