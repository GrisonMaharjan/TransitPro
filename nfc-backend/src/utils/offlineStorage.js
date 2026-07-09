const sqliteDB = require('../config/sqlite');

const saveOfflineTransaction = ({
    nfcUid,
    sourceStop,
    destinationStop,
    fare
}) => {

    sqliteDB.run(
        `
        INSERT INTO offline_transactions
        (nfcUid, sourceStop, destinationStop, fare)
        VALUES (?, ?, ?, ?)
        `,
        [nfcUid, sourceStop, destinationStop, fare],
        function (err) {

            if (err) {
                console.log('SQLite insert error:', err.message);
            } else {
                console.log('Offline transaction saved');
            }

        }
    );

};

module.exports = saveOfflineTransaction;