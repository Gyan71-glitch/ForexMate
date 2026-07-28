import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sessionId = "241f9ade-6df9-4a62-8638-950757985876";
  const order = await prisma.order.findFirst({ where: { sessionId } });
  if (order) {
    console.log("Found order:", order.id, order.status);
    await prisma.transactionSession.update({
      where: { id: sessionId },
      data: { status: 'CONVERTED' }
    });
    console.log("Fixed session status to CONVERTED");
  } else {
    console.log("No order found. Clearing idempotencyKey so they can checkout again.");
    await prisma.transactionSession.update({
      where: { id: sessionId },
      data: { idempotencyKey: null }
    });
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
