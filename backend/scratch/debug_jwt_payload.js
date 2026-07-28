const jwt = require('jsonwebtoken');

async function main() {
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teller@forexmate.com',
      password: 'admin123'
    })
  });

  const body = await loginRes.json();
  const access_token = body.data?.access_token;
  const decoded = jwt.decode(access_token);
  console.log('Decoded Token Payload from Server:', decoded);
}

main().catch(console.error);
