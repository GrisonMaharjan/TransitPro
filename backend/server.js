const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Bus-specific Routes
const busAuthRoutes = require('./routes/busAuth');
const busTapRoutes = require('./routes/busTaps');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    console.log('Database Name:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Use Bus-specific Routes
app.use('/api/bus', busAuthRoutes);
app.use('/api/bus', busTapRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.send('TransitPro Bus Backend is running...');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
