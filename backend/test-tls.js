const tls = require('tls');

const options = {
  host: 'ep-summer-brook-aoa67ux6.c-2.ap-southeast-1.aws.neon.tech',
  port: 5432,
  rejectUnauthorized: false // just to check connection
};

console.log('Connecting to', options.host, 'on port', options.port);
const socket = tls.connect(options, () => {
  console.log('TLS connection established successfully!');
  console.log('Authorized:', socket.authorized);
  console.log('Error:', socket.authorizationError);
  socket.write('Q'); // send a dummy byte
});

socket.on('data', (data) => {
  console.log('Received data:', data.toString());
  socket.destroy();
});

socket.on('error', (err) => {
  console.error('TLS Connection Error:', err);
});

socket.on('end', () => {
  console.log('Connection ended.');
});
