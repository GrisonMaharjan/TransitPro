const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Models
const Stop = require('./models/stop.model');
const Route = require('./models/route.model');
const Fare = require('./models/fare.model');

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
const busAuthRoutes = require('./routes/bus.auth.routes');
const busTapRoutes = require('./routes/bus.tap.routes');
const busToolsRoutes = require('./routes/bus.tools.routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// --- ADMINISTRATIVE SEEDING ROUTES ---

/**
 * Seeds the basic stop information into the 'stops' collection.
 */
app.get('/api/seed-stops', async (req, res) => {
    try {
        await Stop.deleteMany();
        const stops = await Stop.insertMany([
            { name: 'Bungamati', order: 1 },
            { name: 'Chhyasikot', order: 2 },
            { name: 'Sainbu', order: 3 },
            { name: 'Bhaisepati', order: 4 },
            { name: 'Nakhu Chowk', order: 5 },
            { name: 'Ekantakuna', order: 6 },
            { name: 'Mahalaxmisthan Chowk', order: 7 },
            { name: 'Lagankhel', order: 8 },
            { name: 'Kumaripati', order: 9 },
            { name: 'Jawalakhel', order: 10 },
            { name: 'Pulchowk Damkal', order: 11 },
            { name: 'Krishna Galli', order: 12 },
            { name: 'Kupondole', order: 13 },
            { name: 'N.A.C', order: 14 },
            { name: 'Ratnapark', order: 15 }
        ]);
        res.json({ success: true, message: 'Sajha Stops seeded successfully.', stopsCount: stops.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * Reads 'fares_seed.json' and populates the 'fares' collection with individual document entries.
 * This is used for precise stage-based fare lookup during Tap-Out.
 */
app.get('/api/seed-fares', async (req, res) => {
    try {
        // 1. Load data from file
        const filePath = path.join(__dirname, '../fares_seed.json');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'fares_seed.json not found' });
        }

        const faresData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const routeName = faresData[0].routeName;

        // 2. Prepare/Refresh Route
        await Route.deleteMany({ name: routeName });
        const stops = await Stop.find().sort({ order: 1 });
        const route = await Route.create({
            name: routeName,
            stops: stops.map(s => s._id)
        });

        // 3. Clear existing fares for this route and insert new ones
        await Fare.deleteMany({ routeId: route._id });

        const faresToInsert = faresData[0].fares.map(f => ({
            routeId: route._id,
            sourceStop: f.from,
            destinationStop: f.to,
            fare: f.price
        }));

        const insertedFares = await Fare.insertMany(faresToInsert);

        res.json({
            success: true,
            message: `Successfully seeded ${insertedFares.length} fares for ${routeName}`,
            routeId: route._id
        });
    } catch (err) {
        console.error('Seeding Error:', err);
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
app.use('/api/route', routeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bus', busAuthRoutes);
app.use('/api/bus', busTapRoutes);
app.use('/api/bus/tools', busToolsRoutes);

app.get('/', (req, res) => {
    res.send('NFC Backend Running 🚀');
});

module.exports = app;
