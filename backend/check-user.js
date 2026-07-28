const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'raiyn1279@gmail.com' },
    include: {
      roleRef: { include: { permissions: { include: { permission: true } } } },
    },
  });
  console.log(
    JSON.stringify(
      user
        ? {
            role: user.roleRef.name,
            perms: user.roleRef.permissions.map((p) => p.permission.action),
          }
        : 'Not found',
      null,
      2,
    ),
  );
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
