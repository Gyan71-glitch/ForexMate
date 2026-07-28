const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Verifying Outward Remittance Database & Lookups ---');

  const purposes = await prisma.transferPurpose.findMany({
    include: { documentRequirements: true }
  });
  console.log(`[OK] Transfer Purposes Found: ${purposes.length}`);
  purposes.forEach(p => {
    console.log(`  • ${p.code} (${p.name}): ${p.documentRequirements.map(d => d.docType).join(', ')}`);
  });

  const countries = await prisma.countryConfiguration.findMany({
    include: { feeConfigurations: true }
  });
  console.log(`[OK] Country Configurations Found: ${countries.length}`);
  countries.forEach(c => {
    console.log(`  • ${c.countryCode} (${c.countryName} - ${c.currencyCode}): ${c.feeConfigurations.length} fee brackets`);
  });

  const product = await prisma.forexProduct.findUnique({ where: { code: 'REMITTANCE' } });
  console.log(`[OK] REMITTANCE ForexProduct Record: ${product ? 'Active (' + product.name + ')' : 'Missing'}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
