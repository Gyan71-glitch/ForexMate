async function test() {
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gyan.softwaredev@gmail.com', password: 'password123' })
  });
  const login = await loginRes.json();
  const token = login.data.access_token;
  const authConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  
  const sessRes = await fetch('http://localhost:3001/api/v1/transaction-engine/session', { method: 'POST', ...authConfig });
  const sess = await sessRes.json();
  const sessionId = sess.data.id;
  
  await fetch(`http://localhost:3001/api/v1/transaction-engine/session/${sessionId}/draft`, { method: 'PUT', ...authConfig, body: JSON.stringify({ product: 'CARD', currency: 'USD', amount: 1000 }) });
  
  await fetch(`http://localhost:3001/api/v1/transaction-engine/session/${sessionId}/quote`, { method: 'POST', ...authConfig, body: JSON.stringify({ product: 'CARD', currency: 'USD', amount: 1000, branchId: 'test' }) });
  
  const checkoutRes = await fetch(`http://localhost:3001/api/v1/transaction-engine/session/${sessionId}/checkout`, { method: 'POST', ...authConfig, body: JSON.stringify({ idempotencyKey: 'test-key' }) });
  const checkout = await checkoutRes.text();
  console.log("Checkout Response:", checkout);
}
test().catch(console.error);
