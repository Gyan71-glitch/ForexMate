const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cc132bc4-5fc5-4e10-ade0-9c3213ced07b'; // SHIVAM YADAV

  // Find user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profiles: true
    }
  });

  if (!user) {
    console.error('User not found!');
    return;
  }

  const profile = user.profiles?.[0];

  console.log(`Creating notifications for user: ${user.fullName} (${user.email})`);

  // Clear existing to avoid duplicate demo data
  await prisma.inAppNotification.deleteMany({
    where: { userId }
  });

  // 1. Welcome Notification
  await prisma.inAppNotification.create({
    data: {
      userId,
      title: 'Welcome to Forexmate!',
      message: `Hello ${user.fullName.split(' ')[0]}, your account has been successfully created. Explore live rates and manage your foreign currency trades securely.`,
      read: false
    }
  });

  // 2. KYC Verified Notification
  await prisma.inAppNotification.create({
    data: {
      userId,
      title: 'KYC Documents Verified',
      message: 'Congratulations! Your PAN and Passport identity documents have been verified and approved by our branch operations team. You are now fully eligible to trade foreign currency.',
      read: false,
      actionUrl: '/dashboard/kyc'
    }
  });

  // Find user's orders
  const orders = profile ? await prisma.order.findMany({
    where: {
      profileId: profile.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  }) : [];

  console.log(`Found ${orders.length} orders for this user.`);

  // 3. Order Completed Notification
  if (orders.length > 0) {
    const latestOrder = orders[0];
    await prisma.inAppNotification.create({
      data: {
        userId,
        title: 'Order Status Update',
        message: `Your foreign exchange transaction order ${latestOrder.orderNumber} has been successfully completed. Download your tax invoice in the documents center.`,
        read: false,
        orderId: latestOrder.id,
        actionUrl: `/dashboard/orders/${latestOrder.id}`
      }
    });
  }

  const count = await prisma.inAppNotification.count({
    where: { userId }
  });
  console.log(`Done! Created ${count} notifications for user.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
