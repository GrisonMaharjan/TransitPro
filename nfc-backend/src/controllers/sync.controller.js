const sqliteDB = require('../config/sqlite');

exports.syncTransactions = async (req, res) => {

    sqliteDB.all(
        `
        SELECT * FROM offline_transactions
        WHERE synced = 0
        `,
        [],
        async (err, rows) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            // Simulate syncing
            rows.forEach((transaction) => {

                console.log('Syncing transaction:', transaction);

                sqliteDB.run(
                    `
                    UPDATE offline_transactions
                    SET synced = 1
                    WHERE id = ?
                    `,
                    [transaction.id]
                );

            });

            res.json({
                message: 'Transactions synced',
                syncedCount: rows.length
            });

        }
    );

};