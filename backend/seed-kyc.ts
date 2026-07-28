import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.kycVerificationRule.createMany({
    data: [
      {
        ruleName: 'PAN Card (All)',
        description: 'Required by RBI for all forex transactions.',
        product: null,
        purpose: null,
        docType: 'PAN',
        required: true,
        usedFor: ['Identity', 'LRS Limits'],
        isActive: true,
      },
      {
        ruleName: 'Passport (Travel)',
        description: 'Required for international travel and foreign exchange.',
        product: null,
        purpose: 'TOURISM',
        docType: 'PASSPORT',
        required: true,
        usedFor: ['Travel', 'Forex Card'],
        isActive: true,
      },
      {
        ruleName: 'Passport (Medical)',
        description: 'Required for international medical travel.',
        product: null,
        purpose: 'MEDICAL',
        docType: 'PASSPORT',
        required: true,
        usedFor: ['Travel', 'Forex Card'],
        isActive: true,
      },
      {
        ruleName: 'Valid Visa (Tourism)',
        description: 'Required for specific destination countries.',
        product: null,
        purpose: 'TOURISM',
        docType: 'VISA',
        required: false,
        usedFor: ['Travel Proof'],
        isActive: true,
      },
      {
        ruleName: 'Confirmed Ticket (Tourism)',
        description: 'Required to verify travel dates.',
        product: null,
        purpose: 'TOURISM',
        docType: 'TICKET',
        required: true,
        usedFor: ['Travel Proof'],
        isActive: true,
      },
      {
        ruleName: 'University Admit Card (Education)',
        description: 'Required for educational remittance or forex.',
        product: null,
        purpose: 'EDUCATION',
        docType: 'ADMIT_CARD',
        required: true,
        usedFor: ['Purpose Proof'],
        isActive: true,
      }
    ],
    skipDuplicates: true,
  });
  console.log('KYC Rules seeded.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
