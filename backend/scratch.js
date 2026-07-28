const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } }
  });
  console.log(JSON.stringify(roles.map(r => ({
    name: r.name,
    permissions: r.permissions.map(p => p.permission.action)
  })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
