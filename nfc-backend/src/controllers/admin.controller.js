const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');


// GET ALL USERS
exports.getAllUsers = async (req, res) => {

    try {

        const users = await User
            .find()
            .select('-password');

        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// GET ALL TRANSACTIONS
exports.getAllTransactions = async (req, res) => {

    try {

        const transactions =
            await Transaction
                .find()
                .populate(
                    'user',
                    'name email'
                );

        res.json(
            transactions
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};