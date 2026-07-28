import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sessionId = "241f9ade-6df9-4a62-8638-950757985876";
  const idempotencyKey = "test_key_123";
  
  const session = await prisma.transactionSession.findUnique({ 
      where: { id: sessionId },
      include: { quotes: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 1 } }
    });

  if (!session) throw new Error('Session not found');
  
  if (session.idempotencyKey && session.idempotencyKey !== idempotencyKey) {
    throw new Error('Invalid idempotency key provided for this session');
  }

  const activeQuote = session.quotes[0];
  if (!activeQuote) throw new Error('No active quote found for this session');
  if (activeQuote.expiresAt < new Date()) {
    throw new Error('Quote has expired. Please generate a new quote.');
  }

  if (!session.userId) throw new Error('User must be authenticated to checkout');

  const profile = await prisma.customerProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) throw new Error('Customer profile incomplete');
  
  const draftState = session.draftState as any || {};
  let branchId = draftState.branchId;
  if (!branchId) {
    const defaultBranch = await prisma.branch.findFirst();
    if (!defaultBranch) throw new Error('System configuration error: No branches available');
    branchId = defaultBranch.id;
  }

  let productCode = draftState.product;
  if (productCode === 'CARD') productCode = 'FOREX_CARD';
  if (!productCode) throw new Error('Product code not found in draft state');
  const forexProduct = await prisma.forexProduct.findUnique({ where: { code: productCode } });
  if (!forexProduct) throw new Error(`Invalid product code: ${productCode}`);

  console.log("All validations passed!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
