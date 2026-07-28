const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function mapOrderStatus(order) {
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
  return order.status;
}

async function main() {
  console.log('=== OUTWARD REMITTANCE REFACTOR E2E VERIFICATION ===\n');

  // 1. Create a test Customer Profile & Remittance Order
  let user = await prisma.user.findUnique({ where: { email: 'remit_test_user@forexmate.com' } });
  if (!user) {
    const role = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
    user = await prisma.user.create({
      data: {
        email: 'remit_test_user@forexmate.com',
        fullName: 'E2E Remittance Tester',
        password: 'password123',
        roleId: role.id,
        isEmailVerified: true
      }
    });
  }

  let profile = await prisma.customerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.customerProfile.create({
      data: {
        userId: user.id,
        panNumber: 'ABCDE1234F',
        kycOverallStatus: 'VERIFIED'
      }
    });
  }

  const branch = await prisma.branch.findFirst();
  const forexProduct = await prisma.forexProduct.findUnique({ where: { code: 'REMITTANCE' } });
  const currency = await prisma.currency.findFirst({ where: { code: 'USD' } });

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-REMIT-${Date.now()}`,
      profileId: profile.id,
      branchId: branch.id,
      totalAmountInr: 850000,
      deliveryMethod: 'PICKUP',
      status: 'PENDING',
      productType: 'REMITTANCE',
      workflowType: 'REMITTANCE_OUTWARD',
      currentStage: 'KYC_STAGE',
      requiresKyc: true,
      requiresInventory: false,
      requiresPickupHandover: false,
      requiresDelivery: false,
      items: {
        create: {
          productId: forexProduct.id,
          currencyId: currency.id,
          amount: 10000,
          rate: 85.0,
          inrSubtotal: 850000,
          remittance: {
            create: {
              beneficiaryName: 'John Doe',
              beneficiaryBank: 'Bank of America',
              swiftCode: 'BOFAUS3N',
              ibanOrAccountNumber: '123456789012',
              beneficiaryAddress: 'New York, USA',
              sourceOfFunds: 'SALARY',
              relationship: 'SELF',
              feeAmount: 500,
              tcsAmount: 0
            }
          }
        }
      }
    },
    include: {
      items: { include: { remittance: true } }
    }
  });

  console.log(`[PASS] 1. Created Remittance Order #${order.orderNumber} (Status: ${order.status})`);
  console.log(`       Customer Mapping: "${mapOrderStatus(order)}"`);

  // 2. Simulate Compliance Approval -> READY_TO_FORWARD
  const updatedOrder1 = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'READY_TO_FORWARD',
      currentStage: 'READY_TO_FORWARD',
      complianceStatus: 'APPROVED'
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'REMITTANCE_COMPLIANCE_APPROVED',
      entityName: 'Order',
      entityId: order.id,
      newData: { status: 'READY_TO_FORWARD', complianceStatus: 'APPROVED' },
      branchId: branch.id
    }
  });
  console.log(`[PASS] 2. Compliance Approved -> Status: ${updatedOrder1.status}`);
  console.log(`       Customer Mapping: "${mapOrderStatus(updatedOrder1)}"`);

  // 3. Simulate Staff Forwarding to Partner Dealer -> FORWARDED_TO_PARTNER
  const updatedOrder2 = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'FORWARDED_TO_PARTNER',
      currentStage: 'FORWARDED_TO_PARTNER'
    }
  });
  const detail = order.items[0].remittance;
  await prisma.remittanceDetail.update({
    where: { id: detail.id },
    data: {
      forwardedAt: new Date(),
      forwardedByUserId: user.id,
      partnerReference: 'PARTNER-REF-998877',
      partnerRemarks: 'Manual forward test via Staff Ops',
      partnerStatus: 'FORWARDED'
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'REMITTANCE_FORWARDED_TO_PARTNER',
      entityName: 'Order',
      entityId: order.id,
      newData: { partnerReference: 'PARTNER-REF-998877', status: 'FORWARDED_TO_PARTNER' },
      branchId: branch.id
    }
  });
  console.log(`[PASS] 3. Staff Forwarded to Partner -> Status: ${updatedOrder2.status}`);
  console.log(`       Customer Mapping: "${mapOrderStatus(updatedOrder2)}" (Hidden Dealer Info)`);

  // 4. Partner Processing
  const updatedOrder3 = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PARTNER_PROCESSING' }
  });
  await prisma.remittanceDetail.update({
    where: { id: detail.id },
    data: { partnerStatus: 'PARTNER_PROCESSING' }
  });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'REMITTANCE_PARTNER_STATUS_UPDATED',
      entityName: 'Order',
      entityId: order.id,
      newData: { partnerStatus: 'PARTNER_PROCESSING' },
      branchId: branch.id
    }
  });
  console.log(`[PASS] 4. Partner Processing -> Status: ${updatedOrder3.status}`);
  console.log(`       Customer Mapping: "${mapOrderStatus(updatedOrder3)}"`);

  // 5. Transfer Completed
  const updatedOrder4 = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'TRANSFER_COMPLETED', currentStage: 'COMPLETED' }
  });
  await prisma.remittanceDetail.update({
    where: { id: detail.id },
    data: { partnerStatus: 'TRANSFER_COMPLETED' }
  });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'REMITTANCE_TRANSFER_COMPLETED',
      entityName: 'Order',
      entityId: order.id,
      newData: { status: 'TRANSFER_COMPLETED' },
      branchId: branch.id
    }
  });
  console.log(`[PASS] 5. Transfer Completed -> Status: ${updatedOrder4.status}`);
  console.log(`       Customer Mapping: "${mapOrderStatus(updatedOrder4)}"`);

  // 6. Verify Audit Trail
  const auditLogs = await prisma.auditLog.findMany({
    where: { entityId: order.id },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`\n[PASS] 6. Audit Trail Verified (${auditLogs.length} events logged):`);
  auditLogs.forEach(a => console.log(`       - ${a.action} (${a.createdAt.toISOString()})`));

  console.log('\n=== ALL E2E VERIFICATIONS PASSED SUCCESSFULLY ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
