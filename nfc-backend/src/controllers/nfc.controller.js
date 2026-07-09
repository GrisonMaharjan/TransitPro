const User = require('../models/user.model');

exports.linkCard = async (req, res) => {

    try {

        const { nfcUid } = req.body;

        if (!nfcUid) {
            return res.status(400).json({
                message: 'NFC UID required'
            });
        }

        const existingCard = await User.findOne({ nfcUid });

        if (existingCard) {
            return res.status(400).json({
                message: 'Card already linked'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.nfcUid = nfcUid;

        await user.save();

        res.json({
            message: 'NFC card linked successfully',
            nfcUid: user.nfcUid
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};