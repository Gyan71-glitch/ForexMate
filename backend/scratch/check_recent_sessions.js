const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.userSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        include: {
          roleRef: true,
          staffProfile: {
            include: {
              branch: true
            }
          }
        }
      }
    }
  });

  console.log('Recent User Sessions:');
  for (const s of sessions) {
    console.log(`Session ID: ${s.id}`);
    console.log(`User: ${s.user.fullName} (${s.user.email})`);
    console.log(`Role: ${s.user.roleRef?.name}`);
    console.log(`Branch: ${s.user.staffProfile?.branch?.branchName || 'None'}`);
    console.log(`Created At: ${s.createdAt}`);
    console.log(`Revoked: ${s.revokedAt !== null}`);
    console.log('---------------------------------------------');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
