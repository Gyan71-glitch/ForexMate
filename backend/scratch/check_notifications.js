const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.inAppNotification.count();
  console.log('Total notifications in DB:', count);

  const notifications = await prisma.inAppNotification.findMany({
    take: 10,
    include: {
      user: true
    }
  });

  console.log('Recent 10 notifications:');
  for (const n of notifications) {
    console.log(`ID: ${n.id}, User: ${n.user?.fullName || n.userId}, Title: ${n.title}, Msg: ${n.message}, Read: ${n.read}`);
  }

  const users = await prisma.user.findMany({
    include: {
      roleRef: true
    }
  });
  console.log('Users in DB:');
  for (const u of users) {
    console.log(`ID: ${u.id}, Name: ${u.fullName}, Email: ${u.email}, Role: ${u.roleRef?.name}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
