import { PrismaClient, TicketPriority, TicketDepartment } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Forex Currency', icon: 'coins', defaultPriority: TicketPriority.MEDIUM, department: TicketDepartment.SUPPORT },
  { name: 'Forex Card', icon: 'credit-card', defaultPriority: TicketPriority.MEDIUM, department: TicketDepartment.SUPPORT },
  { name: 'Card Reload', icon: 'refresh-cw', defaultPriority: TicketPriority.HIGH, department: TicketDepartment.SUPPORT },
  { name: 'Card Refund', icon: 'undo', defaultPriority: TicketPriority.HIGH, department: TicketDepartment.FINANCE },
  { name: 'Remittance', icon: 'send', defaultPriority: TicketPriority.HIGH, department: TicketDepartment.TREASURY },
  { name: 'Order Issue', icon: 'alert-circle', defaultPriority: TicketPriority.HIGH, department: TicketDepartment.SUPPORT },
  { name: 'Payment Issue', icon: 'alert-triangle', defaultPriority: TicketPriority.CRITICAL, department: TicketDepartment.FINANCE },
  { name: 'KYC Verification', icon: 'file-check', defaultPriority: TicketPriority.MEDIUM, department: TicketDepartment.COMPLIANCE },
  { name: 'Document Verification', icon: 'file-search', defaultPriority: TicketPriority.MEDIUM, department: TicketDepartment.COMPLIANCE },
  { name: 'Branch Support', icon: 'building', defaultPriority: TicketPriority.LOW, department: TicketDepartment.SUPPORT },
  { name: 'Corporate Forex', icon: 'briefcase', defaultPriority: TicketPriority.HIGH, department: TicketDepartment.DEALER },
  { name: 'Complaint', icon: 'frown', defaultPriority: TicketPriority.HIGH, department: TicketDepartment.SUPPORT },
  { name: 'Technical Issue', icon: 'monitor-off', defaultPriority: TicketPriority.MEDIUM, department: TicketDepartment.IT },
  { name: 'General Query', icon: 'help-circle', defaultPriority: TicketPriority.LOW, department: TicketDepartment.SUPPORT },
  { name: 'Feedback', icon: 'message-square', defaultPriority: TicketPriority.LOW, department: TicketDepartment.SUPPORT }
];

async function main() {
  console.log('Seeding Ticket Categories...');
  
  // Clear existing
  await prisma.ticketCategory.deleteMany({});

  for (const cat of categories) {
    await prisma.ticketCategory.create({
      data: cat,
    });
  }

  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
