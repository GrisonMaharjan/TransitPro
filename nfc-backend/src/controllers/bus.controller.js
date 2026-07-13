const Bus = require('../models/bus.model');

exports.getAllBuses = async (req, res) => {
    try {
        const buses = await Bus.find().populate('route');
        res.json(buses);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getBusById = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id).populate('route');

        if (!bus) {
            return res.status(404).json({
                message: 'Bus not found'
            });
        }

        res.json(bus);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.createBus = async (req, res) => {
    try {
        const { busNumber, route } = req.body;

        if (!busNumber) {
            return res.status(400).json({
                message: 'Bus number is required'
            });
        }

        const bus = await Bus.create({
            busNumber,
            route: route || null
        });

        res.status(201).json(bus);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.updateBus = async (req, res) => {
    try {
        const bus = await Bus.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('route');

        if (!bus) {
            return res.status(404).json({
                message: 'Bus not found'
            });
        }

        res.json(bus);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.deleteBus = async (req, res) => {
    try {
        const bus = await Bus.findByIdAndDelete(req.params.id);

        if (!bus) {
            return res.status(404).json({
                message: 'Bus not found'
            });
        }

        res.json({
            message: 'Bus deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
