const crypto = require('crypto');

// Generate a random secret key
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log(`Generated JWT Secret: ${jwtSecret}`);