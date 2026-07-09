const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const Stop = require('../models/stop.model');

exports.tap = async (req, res) => {

    try {

        const { stopName } = req.body;

        const currentStop = await Stop.findOne({ name: stopName });

        if (!currentStop) {
            return res.status(404).json({
                message: 'Stop not found'
            });
        }

        const user = await User.findById(req.user._id).populate('tapInStop');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // =========================
        // TAP IN
        // =========================

        if (!user.isTappedIn) {

            user.isTappedIn = true;
            user.tapInStop = currentStop._id;

            await user.save();

            await Transaction.create({
                user: user._id,
                type: 'tap-in',
                sourceStop: currentStop.name,
                fare: 0
            });

            return res.json({
                message: 'Tap In successful',
                sourceStop: currentStop.name
            });
        }

        // =========================
        // TAP OUT
        // =========================

        const sourceStopName = user.tapInStop.name;
        const sourceOrder = user.tapInStop.order;
        const destinationOrder = currentStop.order;

        const stopsCrossed = Math.abs(destinationOrder - sourceOrder);

        const farePerStop = 10;
        const totalFare = stopsCrossed * farePerStop;

        if (user.balance < totalFare) {
            return res.status(400).json({
                message: 'Insufficient balance'
            });
        }

        user.balance -= totalFare;
        user.isTappedIn = false;
        user.tapInStop = null;

        await user.save();

        await Transaction.create({
            user: user._id,
            type: 'tap-out',
            sourceStop: sourceStopName,
            destinationStop: currentStop.name,
            fare: totalFare
        });

        return res.json({
            message: 'Tap Out successful',
            sourceStop: sourceStopName,
            destinationStop: currentStop.name,
            stopsCrossed,
            fareCharged: totalFare,
            remainingBalance: user.balance
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};