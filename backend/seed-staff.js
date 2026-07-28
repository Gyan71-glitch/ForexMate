const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const managerRole = await prisma.role.upsert({
    where: { name: 'BRANCH_MANAGER' },
    update: {},
    create: { name: 'BRANCH_MANAGER' },
  });

  const opsRole = await prisma.role.upsert({
    where: { name: 'BRANCH_OPERATIONS' },
    update: {},
    create: { name: 'BRANCH_OPERATIONS' },
  });

  const passwordHash = await bcrypt.hash('Staff@123!', 12);

  await prisma.user.upsert({
    where: { email: 'manager@forexmate.com' },
    update: { roleId: managerRole.id },
    create: {
      email: 'manager@forexmate.com',
      password: passwordHash,
      fullName: 'Branch Manager',
      roleId: managerRole.id,
      isEmailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'ops@forexmate.com' },
    update: { roleId: opsRole.id },
    create: {
      email: 'ops@forexmate.com',
      password: passwordHash,
      fullName: 'Operations Staff',
      roleId: opsRole.id,
      isEmailVerified: true,
    },
  });

  console.log('✅ Staff accounts created successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
