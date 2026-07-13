const Stop = require('../models/stop.model');

// ============================
// Get All Stops
// ============================
exports.getAllStops = async (req, res) => {

    try {

        const stops = await Stop
            .find()
            .sort({ order: 1 });

        res.json(stops);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ============================
// Get Stop By ID
// ============================
exports.getStopById = async (req, res) => {

    try {

        const stop = await Stop.findById(req.params.id);

        if (!stop) {

            return res.status(404).json({
                message: 'Stop not found'
            });

        }

        res.json(stop);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ============================
// Create Stop
// ============================
exports.createStop = async (req, res) => {

    try {

        const { name, order } = req.body;

        const exists = await Stop.findOne({ name });

        if (exists) {

            return res.status(400).json({
                message: 'Stop already exists'
            });

        }

        const stop = await Stop.create({
            name,
            order
        });

        res.status(201).json(stop);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ============================
// Update Stop
// ============================
exports.updateStop = async (req, res) => {

    try {

        const stop = await Stop.findById(req.params.id);

        if (!stop) {

            return res.status(404).json({
                message: 'Stop not found'
            });

        }

        stop.name = req.body.name || stop.name;
        stop.order = req.body.order || stop.order;

        await stop.save();

        res.json(stop);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ============================
// Delete Stop
// ============================
exports.deleteStop = async (req, res) => {

    try {

        const stop = await Stop.findById(req.params.id);

        if (!stop) {

            return res.status(404).json({
                message: 'Stop not found'
            });

        }

        await stop.deleteOne();

        res.json({
            message: 'Stop deleted successfully'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};