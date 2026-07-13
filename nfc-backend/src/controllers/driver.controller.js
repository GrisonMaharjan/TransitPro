const User = require('../models/user.model');

exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver' }).select('-password');
        res.json(drivers);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getDriverById = async (req, res) => {
    try {
        const driver = await User.findOne({
            _id: req.params.id,
            role: 'driver'
        }).select('-password');

        if (!driver) {
            return res.status(404).json({
                message: 'Driver not found'
            });
        }

        res.json(driver);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
