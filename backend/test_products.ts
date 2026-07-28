import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.forexProduct.findMany().then(console.log).finally(() => prisma.$disconnect());
