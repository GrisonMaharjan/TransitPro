const User = require('../models/user.model');

exports.rechargeWallet = async (req, res) => {

    try {

        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: 'Invalid recharge amount'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.balance += amount;

        await user.save();

        res.json({
            message: 'Wallet recharged successfully',
            addedAmount: amount,
            currentBalance: user.balance
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};