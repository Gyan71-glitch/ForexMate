const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const perms = [
    { action: 'treasury:read:all' },
    { action: 'treasury:manage:all' }
  ];

  for (const p of perms) {
    await prisma.permission.upsert({
      where: { action: p.action },
      update: {},
      create: p
    });
  }

  const dealer = await prisma.role.findUnique({ where: { name: 'DEALER' } });
  const superAdmin = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });

  const assignPerms = async (roleId) => {
    if (!roleId) return;
    for (const p of perms) {
      const permRecord = await prisma.permission.findUnique({ where: { action: p.action } });
      
      const existing = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: { roleId, permissionId: permRecord.id }
        }
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: { roleId, permissionId: permRecord.id }
        });
      }
    }
  };

  await assignPerms(dealer?.id);
  await assignPerms(superAdmin?.id);
  
  console.log("Permissions seeded successfully.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
