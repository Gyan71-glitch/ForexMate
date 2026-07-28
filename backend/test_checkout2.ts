import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sessionId = "241f9ade-6df9-4a62-8638-950757985876";
  const session = await prisma.transactionSession.findUnique({ 
    where: { id: sessionId },
    include: { quotes: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 1 } }
  });
  if (!session) return console.log('Session not found');

  const activeQuote = session.quotes[0];
  console.log("active quote:", activeQuote);

  const idempotencyKey = session.idempotencyKey;
  console.log("idempotencyKey in DB:", idempotencyKey);
  console.log("session status:", session.status);
}
main().catch(console.error).finally(() => prisma.$disconnect());
