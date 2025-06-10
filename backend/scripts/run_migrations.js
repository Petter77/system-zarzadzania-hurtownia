const fs = require('fs');
const path = require('path');
const db = require('../db');

const migrationsDir = path.join(__dirname, '..', 'migrations');

// Pobierz listę plików migracji
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

// Wykonaj każdą migrację
async function runMigrations() {
  try {
    for (const file of migrationFiles) {
      console.log(`Wykonywanie migracji: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await new Promise((resolve, reject) => {
        db.query(sql, (err) => {
          if (err) {
            console.error(`Błąd podczas wykonywania migracji ${file}:`, err);
            reject(err);
          } else {
            console.log(`Migracja ${file} wykonana pomyślnie`);
            resolve();
          }
        });
      });
    }
    
    console.log('Wszystkie migracje wykonane pomyślnie');
    process.exit(0);
  } catch (error) {
    console.error('Błąd podczas wykonywania migracji:', error);
    process.exit(1);
  }
}

runMigrations(); 