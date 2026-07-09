const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');

exports.getProfile = async (req, res) => {

    try {

        const user = await User
            .findById(req.user._id)
            .select('-password');

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.getMyTransactions = async (req, res) => {

    try {

        const transactions = await Transaction
            .find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.json(transactions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};