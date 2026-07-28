const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orders = await prisma.order.findMany({ where: { orderNumber: 'ORD-97556588' }, include: { items: true } });
  console.log("Orders:", JSON.stringify(orders, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
