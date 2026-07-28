import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sessionId = "241f9ade-6df9-4a62-8638-950757985876";
  const session = await prisma.transactionSession.findUnique({ 
    where: { id: sessionId },
    include: { quotes: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 1 } }
  });

  if (!session) { console.log('Session not found'); return; }
  
  const draftState = session.draftState as any || {};
  let branchId = draftState.branchId;
  if (!branchId) {
    const defaultBranch = await prisma.branch.findFirst();
    branchId = defaultBranch?.id;
  }
  
  const productCode = draftState.product;
  const forexProduct = await prisma.forexProduct.findUnique({ where: { code: productCode } });
  
  console.log("Draft state:", draftState);
  console.log("Product code:", productCode);
  console.log("ForexProduct found:", !!forexProduct);
  
  const profile = await prisma.customerProfile.findUnique({ where: { userId: session.userId || '' } });
  console.log("Customer profile found:", !!profile);
  
  const activeQuote = session.quotes[0];
  console.log("Active quote found:", !!activeQuote);
  if (activeQuote) {
    console.log("Quote expires at:", activeQuote.expiresAt, "now:", new Date());
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
