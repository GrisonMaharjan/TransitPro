const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const bcrypt = require('bcryptjs');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const buildUserPayload = (user) => ({
    _id: user._id,
    accountCode: user._id.toString().slice(-8).toUpperCase(),
    name: user.name,
    fullName: user.name,
    mobileNumber: user.mobileNumber,
    email: user.email,
    role: user.role,
    balance: user.balance,
    isTappedIn: user.isTappedIn,
    tapInStop: user.tapInStop,
    currentRoute: user.currentRoute,
    nfcUid: user.nfcUid,
    isNfcBlocked: user.isNfcBlocked || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

exports.getProfile = async (req, res) => {

    try {

        const user = await User
            .findById(req.user._id)
            .select('-password');

        res.json(buildUserPayload(user));

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

exports.getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const lastRecharge = await Transaction.findOne({
            user: req.user._id,
            type: 'credit'
        }).sort({ createdAt: -1 });

        res.json({
            balance: user.balance,
            cardNumber: user.nfcUid || '',
            lastRechargeDate: lastRecharge ? lastRecharge.createdAt : null,
            user: buildUserPayload(user)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getTransactionSummary = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user._id,
            type: { $in: ['tap-out', 'credit'] }
        }).sort({ createdAt: -1 });

        const mappedTransactions = transactions.map((transaction) => ({
            id: transaction._id,
            type: transaction.type === 'credit' ? 'credit' : 'debit',
            fare: transaction.fare || 0,
            sourceStop: transaction.sourceStop || null,
            destinationStop: transaction.destinationStop || null,
            boardingStop: transaction.sourceStop || null,
            routeName: transaction.type === 'credit'
                ? 'Wallet Recharge'
                : (transaction.sourceStop && transaction.destinationStop
                    ? `${transaction.sourceStop} → ${transaction.destinationStop}`
                    : 'Bus Fare'),
            createdAt: transaction.createdAt
        }));

        const currentMonth = new Date();
        const currentMonthIndex = currentMonth.getMonth();
        const currentYear = currentMonth.getFullYear();

        const monthlyTransactions = transactions.filter((transaction) => {
            const createdAt = new Date(transaction.createdAt);
            return createdAt.getMonth() === currentMonthIndex && createdAt.getFullYear() === currentYear;
        });

        const monthlyTrips = monthlyTransactions.filter((transaction) => transaction.type !== 'credit');
        const monthlySpent = monthlyTrips.reduce((sum, transaction) => sum + (transaction.fare || 0), 0);

        const routeFrequency = new Map();
        monthlyTrips.forEach((transaction) => {
            const routeKey = `${transaction.sourceStop || 'Unknown'} → ${transaction.destinationStop || 'Unknown'}`;
            routeFrequency.set(routeKey, (routeFrequency.get(routeKey) || 0) + 1);
        });

        let mostUsedRoute = '-';
        let highestCount = 0;
        routeFrequency.forEach((count, routeName) => {
            if (count > highestCount) {
                highestCount = count;
                mostUsedRoute = routeName;
            }
        });

        res.json({
            transactions: mappedTransactions,
            monthlyTotal: monthlyTrips.length,
            monthlySpent,
            mostUsedRoute
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, name, email, mobileNumber } = req.body;
        const resolvedName = fullName || name;
        const normalizedEmail = email?.toLowerCase();
        const normalizedMobile = String(mobileNumber || '').trim();

        if (!resolvedName || !normalizedEmail || !normalizedMobile) {
            return res.status(400).json({
                message: 'Name, email, and mobile number are required'
            });
        }

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address'
            });
        }

        if (!MOBILE_REGEX.test(normalizedMobile)) {
            return res.status(400).json({
                message: 'Please enter a valid 10-digit mobile number'
            });
        }

        const existingEmail = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user._id }
        });

        if (existingEmail) {
            return res.status(400).json({
                message: 'Email is already in use'
            });
        }

        const existingMobile = await User.findOne({
            mobileNumber: normalizedMobile,
            _id: { $ne: req.user._id }
        });

        if (existingMobile) {
            return res.status(400).json({
                message: 'Mobile number is already registered'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.name = resolvedName;
        user.email = normalizedEmail;
        user.mobileNumber = normalizedMobile;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: buildUserPayload(user)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current password and new password are required'
            });
        }

        if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.toggleNfcBlock = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: 'Password is required to toggle NFC status'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Incorrect password'
            });
        }

        // Toggle status
        user.isNfcBlocked = !user.isNfcBlocked;
        await user.save();

        res.json({
            message: `NFC Card ${user.isNfcBlocked ? 'Blocked' : 'Unblocked'} successfully`,
            isNfcBlocked: user.isNfcBlocked
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getNfcStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Count taps in the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const tapCount = await Transaction.countDocuments({
            user: req.user._id,
            type: 'tap-out', // Assuming tap-out completes a trip
            createdAt: { $gte: oneWeekAgo }
        });

        res.json({
            nfcUid: user.nfcUid,
            isNfcBlocked: user.isNfcBlocked || false,
            weeklyTaps: tapCount,
            status: user.isNfcBlocked ? 'Blocked' : 'Active'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
