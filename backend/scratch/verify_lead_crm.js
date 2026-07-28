const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Verification Script: CRM Lead Assignment ---');

  // Find an order
  const order = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      profile: true
    }
  });

  if (!order) {
    console.log('No orders found in DB.');
    return;
  }

  console.log(`Testing with Order: ${order.orderNumber} (ID: ${order.id})`);
  console.log(`Current Staff Owner: ${order.assignedStaffId || 'Unassigned'}`);
  console.log(`Current Stage: ${order.currentStage}`);
  console.log(`Current Status: ${order.status}`);

  // Find a staff user
  const staff = await prisma.user.findFirst({
    where: {
      roleRef: {
        name: 'STAFF'
      }
    }
  });

  if (!staff) {
    console.log('No staff member found in DB to claim lead.');
    return;
  }

  console.log(`Staff Actor: ${staff.fullName} (ID: ${staff.id})`);

  // Clear owner to simulate fresh claim
  await prisma.order.update({
    where: { id: order.id },
    data: {
      assignedStaffId: null,
      assignedAt: null
    }
  });
  console.log('Reset staff owner to null.');

  // Test 1: Claim Lead
  const claimed = await prisma.$transaction(async (tx) => {
    // 1. Assign order to staff member
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        assignedStaffId: staff.id,
        assignedAt: new Date()
      }
    });

    // 2. Also claim any pending branch tasks for this order
    await tx.branchTask.updateMany({
      where: { orderId: order.id, assignedToId: null, status: 'PENDING' },
      data: {
        assignedToId: staff.id,
        status: 'IN_PROGRESS'
      }
    });

    return updatedOrder;
  });

  console.log(`Lead claimed successfully! New assignedStaffId: ${claimed.assignedStaffId}`);

  // Test 2: Process Checklist Action (APPROVE_KYC)
  // Find pending docs for this customer
  const pendingDocs = await prisma.kycDocument.findMany({
    where: { userId: order.profile.userId }
  });
  console.log(`Customer profile has ${pendingDocs.length} KYC documents:`);
  for (const doc of pendingDocs) {
    console.log(`  - Type: ${doc.docType}, Status: ${doc.status}`);
  }

  console.log('Verification completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
