const Transaction = require('../models/transaction.model');

/**
 * Get all transactions (Admin only)
 */
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

/**
 * Get logged-in passenger's transactions
 * Formats the data for the frontend 'History' screen.
 */
exports.getMyTransactions = async (req, res) => {
    try {
        // Fetch completed trips (tap-out) and recharges (credit)
        const transactions = await Transaction.find({
            user: req.user._id,
            type: { $in: ['tap-out', 'credit'] }
        }).sort({ createdAt: -1 });

        // Map data to the format expected by the React Native frontend
        const mappedTransactions = transactions.map((transaction) => ({
            id: transaction._id,
            type: transaction.type === 'credit' ? 'credit' : 'debit',
            fare: transaction.fare || 0,
            sourceStop: transaction.sourceStop || null,
            destinationStop: transaction.destinationStop || null,
            boardingStop: transaction.sourceStop || null, // UI uses boardingStop
            routeName: transaction.type === 'credit'
                ? 'Wallet Recharge'
                : (transaction.sourceStop && transaction.destinationStop
                    ? `${transaction.sourceStop} → ${transaction.destinationStop}`
                    : 'Bus Fare'),
            createdAt: transaction.createdAt
        }));

        // Calculate some basic stats for the dashboard summary
        const currentMonth = new Date();
        const currentMonthIndex = currentMonth.getMonth();
        const currentYear = currentMonth.getFullYear();

        const monthlyTransactions = transactions.filter((transaction) => {
            const createdAt = new Date(transaction.createdAt);
            return createdAt.getMonth() === currentMonthIndex && createdAt.getFullYear() === currentYear;
        });

        const monthlyTrips = monthlyTransactions.filter((transaction) => transaction.type !== 'credit');
        const monthlySpent = monthlyTrips.reduce((sum, transaction) => sum + (transaction.fare || 0), 0);

        res.json({
            success: true,
            transactions: mappedTransactions,
            monthlyTotal: monthlyTrips.length,
            monthlySpent,
            count: mappedTransactions.length
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching history'
        });
    }
};
