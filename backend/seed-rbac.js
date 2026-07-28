const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ROLES = [
  'CUSTOMER',
  'AGENT',
  'STAFF',
  'BRANCH_MANAGER',
  'COMPLIANCE',
  'DEALER',
  'ACCOUNTANT',
  'SUPER_ADMIN',
];

const PERMISSIONS = [
  'orders:read:own',
  'orders:read:all',
  'orders:update:status',
  'rates:read',
  'rates:update',
  'kyc:upload:own',
  'kyc:review:all',
  'vault:read:branch',
  'vault:write:branch',
  'vault:read:global',
  'reports:financial',
  'users:manage:all',
];

const ROLE_PERMISSIONS = {
  CUSTOMER: ['orders:read:own', 'rates:read', 'kyc:upload:own'],
  AGENT: ['orders:read:own', 'rates:read', 'kyc:upload:own'],
  STAFF: [
    'orders:read:all',
    'orders:update:status',
    'rates:read',
    'vault:read:branch',
    'vault:write:branch',
  ],
  BRANCH_MANAGER: [
    'orders:read:all',
    'orders:update:status',
    'rates:read',
    'kyc:review:all',
    'vault:read:branch',
    'vault:write:branch',
    'users:manage:all',
  ],
  COMPLIANCE: ['orders:read:all', 'rates:read', 'kyc:review:all'],
  DEALER: ['orders:read:all', 'rates:read', 'rates:update', 'vault:read:global'],
  ACCOUNTANT: ['orders:read:all', 'rates:read', 'vault:read:global', 'reports:financial'],
  SUPER_ADMIN: PERMISSIONS, // All permissions
};

async function main() {
  console.log('Starting Dynamic Roles & Permissions seeding...');

  // 1. Seed Roles
  const dbRoles = {};
  for (const roleName of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    dbRoles[roleName] = role;
    console.log(`Role [${roleName}] seeded.`);
  }

  // 2. Seed Permissions
  const dbPermissions = {};
  for (const action of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    });
    dbPermissions[action] = perm;
    console.log(`Permission [${action}] seeded.`);
  }

  // 3. Clear and Link RolePermissions
  await prisma.rolePermission.deleteMany({});
  for (const [roleName, actions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = dbRoles[roleName];
    for (const action of actions) {
      const permission = dbPermissions[action];
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`Linked ${actions.length} permissions to [${roleName}].`);
  }

  // 4. Update legacy users to map role strings to Role IDs
  const users = await prisma.user.findMany({});
  for (const user of users) {
    let targetRoleName = 'CUSTOMER';
    if (user.role === 'ADMIN') {
      targetRoleName = 'SUPER_ADMIN';
    } else if (user.role === 'AGENT') {
      targetRoleName = 'AGENT';
    } else if (user.role === 'EMPLOYEE') {
      targetRoleName = 'STAFF';
    } else if (ROLES.includes(user.role)) {
      targetRoleName = user.role;
    }

    const role = dbRoles[targetRoleName];
    await prisma.user.update({
      where: { id: user.id },
      data: {
        roleId: role.id,
      },
    });
    console.log(`Updated user ${user.email}: mapped string role "${user.role}" to Role ID ${role.id} (${targetRoleName})`);
  }

  console.log('Dynamic Roles & Permissions seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
