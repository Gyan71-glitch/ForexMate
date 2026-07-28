async function test() {
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gyan.softwaredev@gmail.com', password: 'password123' })
  });
  const login = await loginRes.json();
  const token = login.data.access_token;
  
  const summaryRes = await fetch('http://localhost:3001/api/v1/dashboard/summary', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  const summary = await summaryRes.json();
  console.log(JSON.stringify(summary, null, 2));
}
test().catch(console.error);
