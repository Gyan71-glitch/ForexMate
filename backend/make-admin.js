const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  
  if (adminRole) {
    await prisma.user.update({
      where: { email: 'raiyn1279@gmail.com' },
      data: { roleId: adminRole.id }
    });
    console.log("User updated to SUPER_ADMIN.");
  } else {
    console.log("SUPER_ADMIN role not found.");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
