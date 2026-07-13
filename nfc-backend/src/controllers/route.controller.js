const Route = require('../models/route.model');
const Fare = require('../models/fare.model');

// ==========================
// CREATE ROUTE
// ==========================
exports.createRoute = async (req, res) => {
    try {
        const { name, stops } = req.body;
        const exists = await Route.findOne({ name });

        if (exists) {
            return res.status(400).json({ message: 'Route already exists' });
        }

        const route = await Route.create({ name, stops });
        res.status(201).json(route);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// GET ALL ROUTES
// ==========================
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route
            .find()
            .populate('stops')
            .sort({ createdAt: -1 });

        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// GET ROUTE BY ID
// ==========================
exports.getRouteById = async (req, res) => {
    try {
        const route = await Route
            .findById(req.params.id)
            .populate('stops');

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        res.json(route);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/routes/:id/fare?from=StopA&to=StopB
 * Fetches fare between two stops for a specific route.
 */
exports.getRouteFare = async (req, res) => {
    try {
        const { id } = req.params;
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ message: 'Source and destination stops are required' });
        }

        const fareRecord = await Fare.findOne({
            routeId: id,
            sourceStop: from,
            destinationStop: to
        });

        if (!fareRecord) {
            return res.status(404).json({
                message: `No fare record found from ${from} to ${to} for this route.`,
                defaultFare: 18 // Fallback to minimum fare
            });
        }

        res.json({
            routeId: id,
            from,
            to,
            fare: fareRecord.fare
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// UPDATE ROUTE
// ==========================
exports.updateRoute = async (req, res) => {

    try {

        const route = await Route.findById(req.params.id);

        if (!route) {

            return res.status(404).json({
                message: 'Route not found'
            });

        }

        route.name = req.body.name || route.name;

        if (req.body.stops) {
            route.stops = req.body.stops;
        }

        await route.save();

        res.json(route);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ==========================
// DELETE ROUTE
// ==========================
exports.deleteRoute = async (req, res) => {

    try {

        const route = await Route.findById(req.params.id);

        if (!route) {

            return res.status(404).json({
                message: 'Route not found'
            });

        }

        await route.deleteOne();

        res.json({
            message: 'Route deleted successfully'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};