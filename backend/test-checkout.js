const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { profile: true } });
  console.log("Users:", users.map(u => ({ email: u.email, hasProfile: !!u.profile })));
  
  const branches = await prisma.branch.findMany();
  console.log("Branches:", branches.length);
  
  const products = await prisma.forexProduct.findMany();
  console.log("Products:", products.map(p => p.code));
}
main().catch(console.error).finally(() => prisma.$disconnect());
