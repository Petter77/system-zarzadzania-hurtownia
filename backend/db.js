const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'warehousedbv2',
});

db.connect(err => {
  if (err) {
    console.error('❌ Błąd połączenia z MySQL:', err.message);
  } 
});

module.exports = db;