const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const sessions = await prisma.transactionSession.findMany({
    where: { idempotencyKey: { not: null } },
    select: { id: true, status: true, idempotencyKey: true }
  });
  console.log(sessions);
}
check().catch(console.error).finally(() => prisma.$disconnect());
