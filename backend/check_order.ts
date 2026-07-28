import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findUnique({
    where: { id: '181f6d5f-69fb-4742-b503-5a9f63c33750' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      cancelRequested: true,
      cancelReason: true,
    },
  });
  console.log('ORDER FROM DB:', order);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
