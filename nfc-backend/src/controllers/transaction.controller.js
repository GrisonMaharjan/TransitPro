const Transaction = require('../models/transaction.model');

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
