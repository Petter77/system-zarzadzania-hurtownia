const db = require('../db');
const bcrypt = require('bcrypt');

async function createSystemUser() {
  try {
    // Sprawdź, czy użytkownik systemowy już istnieje
    const [existingUsers] = await db.promise().query('SELECT * FROM users WHERE id = 1');
    
    if (existingUsers.length > 0) {
      console.log('Użytkownik systemowy już istnieje');
      process.exit(0);
    }

    // Utwórz użytkownika systemowego
    const hashedPassword = await bcrypt.hash('system123', 10);
    
    await db.promise().query(
      'INSERT INTO users (id, username, password_hash, role) VALUES (1, ?, ?, ?)',
      ['system', hashedPassword, 'manager']
    );

    console.log('Użytkownik systemowy utworzony pomyślnie');
    process.exit(0);
  } catch (error) {
    console.error('Błąd podczas tworzenia użytkownika systemowego:', error);
    process.exit(1);
  }
}

createSystemUser(); 