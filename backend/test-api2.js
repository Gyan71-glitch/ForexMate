const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findUnique({ where: { email: 'gyan.softwaredev@gmail.com' }});
  await prisma.user.update({
    where: { email: 'gyan.softwaredev@gmail.com' },
    data: { password: await bcrypt.hash('password123', 10) }
  });
  
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gyan.softwaredev@gmail.com', password: 'password123' })
  });
  
  const text = await loginRes.text();
  console.log("Login Res text:", text);
}
test().catch(console.error);
