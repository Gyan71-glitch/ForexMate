const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.customerProfile.findMany();
  console.log("Profiles:", profiles.length);
  const branches = await prisma.branch.findMany();
  console.log("Branches:", branches.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
