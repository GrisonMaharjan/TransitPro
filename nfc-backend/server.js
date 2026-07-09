require('dotenv').config();

const app = require('./src/app');

const connectDB = require('./src/config/db');

// MongoDB connection
connectDB();

// SQLite connection
require('./src/config/sqlite');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});