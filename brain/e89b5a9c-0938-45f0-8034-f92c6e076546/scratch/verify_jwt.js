const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZWViOGNhNy0zZTA1LTRlYTYtOTU2NS1jNGFiYTlkY2E5OWMiLCJzZXNzaW9uSWQiOiI1MTEzZWE2OS1iMDQ2LTQyMzYtODAwMC05Y2NlYTFmMDU2M2UiLCJyb2xlSWQiOjEsInJvbGUiOiJDVVNUT01FUiIsImNvbXBhbnlJZCI6bnVsbCwiYnJhbmNoSWQiOm51bGwsImlhdCI6MTc4NDE5MzU1MSwiZXhwIjoxNzg0MTk0NDUxfQ.C0qCNgy8lrzoTsQ6HgPDGPfSGzIkNHiRhyr40OqqFyE';
const secret = 'f0r3xm4t3-jwt-s3cr3t-k3y-2024-v2-ultra-secure-random-string-xyz';

try {
  const decoded = jwt.verify(token, secret);
  console.log('Decoded token:', decoded);
} catch (err) {
  console.error('Verify failed:', err.message);
}
