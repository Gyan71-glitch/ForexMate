import { Prisma, Order, OrderStatus } from '@prisma/client';

export function mapOrderStatus(order: any): string {
  if (order.productType === 'REMITTANCE') {
    if (order.status === 'CANCELLED') return 'CANCELLED';
    if (order.status === 'REJECTED') return 'REJECTED';
    if (order.status === 'PENDING') return 'PENDING_KYC';
    if (order.status === 'KYC_SUBMITTED' || order.status === 'AML_PENDING' || order.status === 'LRS_PENDING') return 'COMPLIANCE_REVIEW';
    if (order.status === 'READY_TO_FORWARD') return 'PROCESSING';
    if (order.status === 'FORWARDED_TO_PARTNER' || order.status === 'PARTNER_PROCESSING') return 'TRANSFER_PROCESSING';
    if (order.status === 'TRANSFER_COMPLETED' || order.status === 'COMPLETED') return 'COMPLETED';
    return order.status;
  }

  if (order.productType === 'CASH_SELL') {
    if (order.status === 'CANCELLED') return 'CANCELLED';
    if (order.status === 'REJECTED') return 'REJECTED';
    if (order.complianceStatus === 'APPROVED') {
      return 'WAITING_FOR_FULFILLMENT';
    }
    if (order.complianceStatus === 'REJECTED') {
      return 'PENDING_KYC';
    }
    return 'PENDING_KYC';
  }

  if (order.status === 'PENDING') {
    return 'PENDING_KYC';
  }
  if (order.status === 'PAYMENT_PENDING') {
    return 'PENDING_PAYMENT';
  }
  if (order.status === 'PAYMENT_COMPLETED') {
    const tasks = order.tasks || [];
    const kycTask = tasks.find((t: any) => t.taskType === 'KYC_REVIEW');
    const inventoryTask = tasks.find((t: any) => t.taskType === 'INVENTORY_PREP');

    if (kycTask && kycTask.status !== 'COMPLETED') {
      return 'PAID_AWAITING_BRANCH_PROCESSING';
    }

    if (inventoryTask && inventoryTask.status === 'COMPLETED') {
      if (order.deliveryMethod === 'HOME_DELIVERY') {
        const handoverTask = tasks.find((t: any) => t.taskType === 'HANDOVER');
        if (handoverTask && handoverTask.status === 'IN_PROGRESS') {
          return 'OUT_FOR_DELIVERY';
        }
        return 'READY_FOR_DELIVERY';
      } else {
        return 'READY_FOR_PICKUP';
      }
    }
    return 'IN_BRANCH_PROCESSING';
  }
  if (order.status === 'DELIVERED') {
    return 'COMPLETED';
  }
  return order.status; // COMPLETED, CANCELLED, REJECTED
}

export async function activateBranchWorkflow(orderId: string, tx: Prisma.TransactionClient) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { profile: true }
  });
  if (!order) return;

  // Delete existing tasks to avoid duplication
  await tx.branchTask.deleteMany({
    where: { orderId }
  });

  if (order.productType === 'REMITTANCE') {
    const kycApproved = order.complianceStatus === 'APPROVED' || order.profile.kycOverallStatus === 'VERIFIED';
    await tx.branchTask.create({
      data: {
        branchId: order.branchId,
        orderId: order.id,
        taskType: 'KYC_REVIEW',
        status: kycApproved ? 'COMPLETED' : 'PENDING',
        notes: kycApproved ? 'Remittance KYC & compliance approved' : 'Verify customer remittance documents, AML screening & LRS limit',
        queueRoleCode: 'BRANCH_KYC_STAFF'
      }
    });
    return;
  }

  const isPickup = order.deliveryMethod === 'PICKUP' || order.deliveryMethod === 'STORE_PICKUP';
  const isDelivery = order.deliveryMethod === 'HOME_DELIVERY';

  // 1. KYC Review Task
  // If the user's kycOverallStatus is already approved/verified, we mark it as COMPLETED
  const kycApproved = order.complianceStatus === 'APPROVED' || order.profile.kycOverallStatus === 'VERIFIED';
  await tx.branchTask.create({
    data: {
      branchId: order.branchId,
      orderId: order.id,
      taskType: 'KYC_REVIEW',
      status: kycApproved ? 'COMPLETED' : 'PENDING',
      notes: kycApproved ? 'KYC approved globally' : 'Perform KYC compliance check for order documents',
      queueRoleCode: 'BRANCH_KYC_STAFF'
    }
  });

  // 2. Inventory Prep Task
  await tx.branchTask.create({
    data: {
      branchId: order.branchId,
      orderId: order.id,
      taskType: 'INVENTORY_PREP',
      status: 'PENDING',
      notes: 'Allocate and verify notes/card inventory',
      queueRoleCode: 'BRANCH_INVENTORY_STAFF'
    }
  });

  // 3. Handover Task
  if (isPickup) {
    await tx.branchTask.create({
      data: {
        branchId: order.branchId,
        orderId: order.id,
        taskType: 'HANDOVER',
        status: 'PENDING',
        notes: 'Awaiting customer branch pickup verification',
        queueRoleCode: 'BRANCH_CASHIER'
      }
    });
  } else if (isDelivery) {
    await tx.branchTask.create({
      data: {
        branchId: order.branchId,
        orderId: order.id,
        taskType: 'HANDOVER',
        status: 'PENDING',
        notes: 'Awaiting dispatch/delivery agent assignment',
        queueRoleCode: 'BRANCH_FULFILLMENT_STAFF'
      }
    });
  }
}
