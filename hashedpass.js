const bcrypt = require('bcryptjs');
const password = 'mani123'; // Replace with your desired password
const hash = bcrypt.hashSync(password, 10);
console.log('Hashed password:', hash);