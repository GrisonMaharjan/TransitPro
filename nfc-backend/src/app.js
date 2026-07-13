const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Models
const Stop = require('./models/stop.model');
const Route = require('./models/route.model');
const Fare = require('./models/fare.model');
const BusUser = require('./models/bus.user.model');

// Routes
const authRoutes = require('./routes/auth.routes');
const tapRoutes = require('./routes/tap.routes');
const { protect } = require('./middleware/auth.middleware');
const walletRoutes = require('./routes/wallet.routes');
const nfcRoutes = require('./routes/nfc.routes');
const syncRoutes = require('./routes/sync.routes');
const adminRoutes = require('./routes/admin.routes');
const routeRoutes = require('./routes/route.routes');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const stopRoutes = require('./routes/stop.routes');
const busRoutes = require('./routes/bus.routes');
const driverRoutes = require('./routes/driver.routes');

// Bus App Specific Routes
const busAuthRoutes = require('./routes/bus.auth.routes');
const busTapRoutes = require('./routes/bus.tap.routes');
const busToolsRoutes = require('./routes/bus.tools.routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// --- UNIFIED SEEDING ROUTE ---

/**
 * Combined seeding route to ensure Stops, Routes, and Fares are perfectly linked.
 * This route generates a FULL FARE MATRIX (Permutations) for all intermediate stops.
 */
app.get('/api/seed-all', async (req, res) => {
    try {
        console.log('--- Starting Database Re-Seed ---');

        // 1. Clear existing data to prevent duplicates
        await Stop.deleteMany();
        await Route.deleteMany();
        await Fare.deleteMany();

        // 2. Define all unique locations with GPS coordinates
        const allLocations = [
            { name: 'Bungamati', order: 1, latitude: 27.628425, longitude: 85.303461 },
            { name: 'Chhyasikot', order: 2, latitude: 27.639054, longitude: 85.304021 },
            { name: 'Sainbu', order: 3, latitude: 27.649678, longitude: 85.305234 },
            { name: 'Bhaisepati', order: 4, latitude: 27.6521, longitude: 85.3028 },
            { name: 'Nakhu Chowk', order: 5, latitude: 27.661438, longitude: 85.305817 },
            { name: 'Ekantakuna', order: 6, latitude: 27.666184, longitude: 85.309622 },
            { name: 'Mahalaxmisthan Chowk', order: 7, latitude: 27.661422, longitude: 85.318103 },
            { name: 'Lagankhel', order: 8, latitude: 27.668434, longitude: 85.321627 },
            { name: 'Kumaripati', order: 9, latitude: 27.671548, longitude: 85.318496 },
            { name: 'Jawalakhel', order: 10, latitude: 27.672854, longitude: 85.313666 },
            { name: 'Pulchowk Damkal', order: 11, latitude: 27.676687, longitude: 85.316129 },
            { name: 'Krishna Galli', order: 12, latitude: 27.680944, longitude: 85.317584 },
            { name: 'Kupondole', order: 13, latitude: 27.688086, longitude: 85.316191 },
            { name: 'N.A.C', order: 14, latitude: 27.701498, longitude: 85.313547 },
            { name: 'Ratnapark', order: 15, latitude: 27.708954, longitude: 85.315735 },
            { name: 'Lamatar', order: 101, latitude: 27.6366, longitude: 85.3948 },
            { name: 'Dungin', order: 102, latitude: 27.6433, longitude: 85.3854 },
            { name: 'Lubhu', order: 103, latitude: 27.6496, longitude: 85.3725 },
            { name: 'Sanagaun', order: 104, latitude: 27.6575, longitude: 85.3618 },
            { name: 'Kamalpokhari', order: 105, latitude: 27.6622, longitude: 85.3524 },
            { name: 'Imadol Krishnamandir', order: 106, latitude: 27.6658, longitude: 85.3442 },
            { name: 'KIST Hospital', order: 107, latitude: 27.6644, longitude: 85.3375 },
            { name: 'Gwarko', order: 108, latitude: 27.6685, longitude: 85.3325 },
            { name: 'Satdobato', order: 109, latitude: 27.6621, longitude: 85.3282 },
            { name: 'Tripureshwor', order: 114, latitude: 27.6934, longitude: 85.3148 },
            { name: 'Jamal', order: 116, latitude: 27.7061, longitude: 85.3147 }
        ];

        const insertedStops = await Stop.insertMany(allLocations);

        // 3. Load Route Templates from seed_stop.json
        const filePath = path.join(__dirname, '../seed_stop.json');
        if (!fs.existsSync(filePath)) {
            console.error('seed_stop.json missing');
            return res.status(404).json({ success: false, message: 'seed_stop.json not found' });
        }

        const faresData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const routeResults = [];

        for (const routeInfo of faresData) {
            // Find stops in routelocation collection
            const stopIds = [];
            for (const name of routeInfo.stops) {
                const found = insertedStops.find(s => s.name === name);
                if (found) stopIds.push(found._id);
            }

            // Create the Route with the EXACT name from your seed file
            const route = await Route.create({
                name: routeInfo.routeName,
                stops: stopIds
            });

            // 4. GENERATE FULL FARE MATRIX
            // We use the manual fares from JSON as priority,
            // and fill the rest of the matrix mathematically for 100% coverage.
            const faresToInsert = [];
            const manualFares = routeInfo.fares || [];

            for (let i = 0; i < routeInfo.stops.length; i++) {
                for (let j = 0; j < routeInfo.stops.length; j++) {
                    if (i === j) continue;

                    const fromName = routeInfo.stops[i];
                    const toName = routeInfo.stops[j];

                    // Check if we have a manual price for this specific pair
                    const manualMatch = manualFares.find(mf => mf.from === fromName && mf.to === toName);

                    let price;
                    if (manualMatch) {
                        price = manualMatch.price;
                    } else {
                        // Mathematical Fallback (Sajha Rules)
                        const stopDistance = Math.abs(i - j);
                        price = 18;
                        if (stopDistance >= 13) price = 35;
                        else if (stopDistance >= 9) price = 30;
                        else if (stopDistance >= 6) price = 25;
                    }

                    faresToInsert.push({
                        routeId: route._id,
                        sourceStop: fromName,
                        destinationStop: toName,
                        fare: price
                    });
                }
            }

            await Fare.insertMany(faresToInsert);

            routeResults.push({
                name: route.name,
                stopsCount: stopIds.length,
                faresCount: faresToInsert.length
            });
        }

        res.json({
            success: true,
            message: 'Database seeded with full fare matrix!',
            stopsCreated: insertedStops.length,
            routesCreated: routeResults
        });
    } catch (err) {
        console.error('Seeding Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/seed-bususers', async (req, res) => {
    try {
        const route1 = await Route.findOne({ name: /Route 1/ });
        const route2 = await Route.findOne({ name: /Route 2/ });

        if (!route1 || !route2) {
            return res.status(404).json({ success: false, message: 'Routes not found. Please run /api/seed-all first.' });
        }

        await BusUser.findOneAndUpdate(
            { busNumber: '0427' },
            {
                busNumber: '0427',
                password: 'password0427',
                vehicleId: 'BA. 2. Pa. 060. 0427',
                depotLocation: 'Pulchowk',
                assignedRoute: route1._id
            },
            { upsert: true, new: true }
        );

        await BusUser.findOneAndUpdate(
            { busNumber: '0000' },
            {
                busNumber: '0000',
                password: 'password0000',
                vehicleId: 'BA. 2. Pa. 060. 0000',
                depotLocation: 'Pulchowk',
                assignedRoute: route2._id
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'Bus users allocated correctly.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- MAIN API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/tap', tapRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/nfc', nfcRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes); // Alias for frontend compatibility
app.use('/api/transactions', transactionRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/drivers', driverRoutes);

// Bus App (Android) Routes
app.use('/api/bus', busAuthRoutes);
app.use('/api/bus', busTapRoutes);
app.use('/api/bus/tools', busToolsRoutes);

// Protected test route
app.get('/protected', protect, (req, res) => {
    res.json({
        message: 'Access granted',
        user: req.user
    });
});

// Root route
app.get('/', (req, res) => {
    res.send('NFC Backend Running 🚀');
});

module.exports = app;
