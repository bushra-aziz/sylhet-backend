const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ─── SAFETY MIDDLEWARE ───
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── CORS FIX (ALL APPS WORK) ───
app.use(cors({
  origin: true,
  credentials: true
}));

// ─── ROUTES ───
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/ordersRoutes'));
app.use('/api/riders', require('./routes/ridersRoutes'));
app.use('/api/merchants', require('./routes/merchantsRoutes'));

// ─── HEALTH ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── 404 ───
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── GLOBAL ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;