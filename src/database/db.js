const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'database.sqlite');

const db = new Database(DB_PATH);

function initializeDatabase() {
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS "Order" (
      orderId    TEXT PRIMARY KEY,
      value      REAL NOT NULL,
      creationDate TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Items (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId   TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity  INTEGER NOT NULL,
      price     REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES "Order"(orderId) ON DELETE CASCADE
    )
  `);

  console.log('✅ Banco de dados inicializado com sucesso.');
}

initializeDatabase();

module.exports = db;
