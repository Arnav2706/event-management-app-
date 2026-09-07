const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Ensure SRV DNS records resolve reliably across environments/ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS fails
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Event Management API is running' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
