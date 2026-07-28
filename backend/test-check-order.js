const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const order = await prisma.order.findFirst({ where: { sessionId: '241f9ade-6df9-4a62-8638-950757985876' } });
  console.log("Order:", order);
}
check().catch(console.error).finally(() => prisma.$disconnect());
