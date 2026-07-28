const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const session = await prisma.userSession.findUnique({
    where: { id: '5113ea69-b046-4236-8000-9ccea1f0563e' }
  });
  console.log('Session details:', session);
}

main().catch(console.error).finally(() => prisma.$disconnect());
