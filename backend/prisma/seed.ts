import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create a dummy Company (Multi-Tenant Architecture)
  const company = await prisma.company.upsert({
    where: { gst: '27AADCB2230M1Z2' },
    update: {},
    create: {
      name: 'Forexmate Global HQ',
      gst: '27AADCB2230M1Z2',
      cin: 'U74999MH2026PTC345678',
      address: 'Maker Chambers, BKC, Mumbai',
      licenseNumber: 'RBI/FFMC/2026/001',
      email: 'hello@forexmate.com',
      phone: '+91 9876543210',
    },
  });

  // 2. Create the HQ Branch
  const branch = await prisma.branch.upsert({
    where: { branchCode: 'HQ-BOM-01' },
    update: {},
    create: {
      companyId: company.id,
      branchCode: 'HQ-BOM-01',
      branchName: 'Mumbai BKC Branch',
      branchAddress: 'Maker Chambers, BKC',
      branchCity: 'Mumbai',
    },
  });

  // 3. Create Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN' },
  });

  // 4. Create Customer Role
  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: { name: 'CUSTOMER' },
  });

  // 5. Create default Admin User
  const passwordHash = await bcrypt.hash('Admin@123!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@forexmate.com' },
    update: {},
    create: {
      email: 'admin@forexmate.com',
      password: passwordHash,
      fullName: 'System Administrator',
      roleId: adminRole.id,
      isEmailVerified: true,
    },
  });

  // 6. Create default Customer User
  const customerHash = await bcrypt.hash('Customer@123!', 12);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@forexmate.com' },
    update: {},
    create: {
      email: 'customer@forexmate.com',
      password: customerHash,
      fullName: 'John Doe',
      roleId: customerRole.id,
      isEmailVerified: true,
    },
  });
 
  // 7. Seed Cashiers
  const cashiers = [
    { name: 'Rahul Sharma', employeeCode: 'CASHIER-001' },
    { name: 'Mohit Kumar', employeeCode: 'CASHIER-002' },
  ];
  for (const c of cashiers) {
    await prisma.cashier.upsert({
      where: { employeeCode: c.employeeCode },
      update: { name: c.name, branchId: branch.id },
      create: {
        name: c.name,
        employeeCode: c.employeeCode,
        branchId: branch.id,
      },
    });
  }

  // 8. Seed Delivery Partners
  const deliveryPartners = [
    { name: 'Rohit Singh', employeeCode: 'DEL-PARTNER-001' },
    { name: 'Aman Verma', employeeCode: 'DEL-PARTNER-002' },
    { name: 'Pawan Gupta', employeeCode: 'DEL-PARTNER-003' },
    { name: 'Sandeep Yadav', employeeCode: 'DEL-PARTNER-004' },
    { name: 'Rakesh Kumar', employeeCode: 'DEL-PARTNER-005' },
  ];
  for (const dp of deliveryPartners) {
    await prisma.deliveryPartner.upsert({
      where: { employeeCode: dp.employeeCode },
      update: { name: dp.name, branchId: branch.id },
      create: {
        name: dp.name,
        employeeCode: dp.employeeCode,
        branchId: branch.id,
      },
    });
  }

  console.log('✅ Seeding completed.');
  console.log('Admin Login: admin@forexmate.com / Admin@123!');
  console.log('Customer Login: customer@forexmate.com / Customer@123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
