const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.userSession.findMany({
    where: { userId: 'deeb8ca7-3e05-4ea6-9565-c4aba9dca99c' },
    orderBy: { createdAt: 'desc' }
  });
  console.log('Sessions:', sessions);
}

main().catch(console.error).finally(() => prisma.$disconnect());
