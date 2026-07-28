async function test() {
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gyan.softwaredev@gmail.com', password: 'password123' })
  });
  const login = await loginRes.json();
  const token = login.data.access_token;
  
  const ordersRes = await fetch('http://localhost:3001/api/v1/orders', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  const orders = await ordersRes.json();
  console.log(JSON.stringify(orders, null, 2));
}
test().catch(console.error);
