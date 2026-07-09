const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./validator.db', (err) => {

    if (err) {
        console.log('SQLite connection error:', err.message);
    } else {
        console.log('SQLite connected');
    }

});

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS offline_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nfcUid TEXT,
            sourceStop TEXT,
            destinationStop TEXT,
            fare INTEGER,
            synced INTEGER DEFAULT 0
        )
    `);

});

module.exports = db;