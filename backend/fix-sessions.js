const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const badSessions = await prisma.transactionSession.findMany({
    where: { 
      idempotencyKey: { not: null },
      status: { not: 'CONVERTED' }
    }
  });

  console.log("Fixing sessions:", badSessions.length);
  
  for (const session of badSessions) {
    const order = await prisma.order.findFirst({ where: { sessionId: session.id } });
    if (order) {
      await prisma.transactionSession.update({
        where: { id: session.id },
        data: { status: 'CONVERTED' }
      });
      console.log(`Fixed session ${session.id} to CONVERTED`);
    } else {
      await prisma.transactionSession.update({
        where: { id: session.id },
        data: { idempotencyKey: null }
      });
      console.log(`Cleared idempotencyKey for session ${session.id}`);
    }
  }
}
fix().catch(console.error).finally(() => prisma.$disconnect());
