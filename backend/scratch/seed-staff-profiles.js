const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.findUnique({
    where: { branchCode: 'DEL-01' }
  });

  if (!branch) {
    console.error('HQ Branch not found.');
    return;
  }

  // 1. Link manager
  const manager = await prisma.user.findUnique({ where: { email: 'manager@forexmate.com' } });
  if (manager) {
    await prisma.branchStaff.upsert({
      where: { userId: manager.id },
      update: { branchId: branch.id, designation: 'BRANCH_MANAGER' },
      create: {
        userId: manager.id,
        branchId: branch.id,
        designation: 'BRANCH_MANAGER'
      }
    });
    console.log('Manager profile mapped to HQ Branch.');
  }

  // 2. Link ops
  const ops = await prisma.user.findUnique({ where: { email: 'ops@forexmate.com' } });
  if (ops) {
    await prisma.branchStaff.upsert({
      where: { userId: ops.id },
      update: { branchId: branch.id, designation: 'BRANCH_OPERATIONS' },
      create: {
        userId: ops.id,
        branchId: branch.id,
        designation: 'BRANCH_OPERATIONS'
      }
    });
    console.log('Ops profile mapped to HQ Branch.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
