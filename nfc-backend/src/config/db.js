const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const User = require('../models/user.model');
        let indexes = [];
        try {
            indexes = await User.collection.indexes();
        } catch (indexError) {
            indexes = [];
        }
        const legacyNfcIndex = indexes.find((index) => index.name === 'nfcUid_1');

        if (legacyNfcIndex) {
            try {
                await User.collection.dropIndex('nfcUid_1');
                console.log('Dropped legacy nfcUid_1 index');
            } catch (dropError) {
                console.warn('Could not drop legacy nfcUid_1 index:', dropError.message);
            }
        }

        try {
            await User.collection.createIndex(
                { nfcUid: 1 },
                {
                    unique: true,
                    partialFilterExpression: {
                        nfcUid: { $type: 'string', $ne: '' }
                    }
                }
            );
            console.log('Ensured partial unique index on nfcUid');
        } catch (createError) {
            console.warn('Could not ensure nfcUid index:', createError.message);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;
