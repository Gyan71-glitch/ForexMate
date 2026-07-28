const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.forexProduct.findMany();
  console.log("Products:", products.map(p => p.code));
  
  const user = await prisma.user.findFirst({ where: { email: 'gyan.softwaredev@gmail.com' }, include: { profiles: true }});
  console.log("User profiles:", user.profiles);
}
main().catch(console.error).finally(() => prisma.$disconnect());
