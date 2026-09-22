const dns = require('dns');
const net = require('net');

dns.resolve4('smtp.gmail.com', (err, addresses) => {
  if (err) {
    console.error('[GMAIL IPV4 DNS ERROR]', err);
    return;
  }

  console.log('[GMAIL IPV4 ADDRESSES]', addresses);

  const ip = addresses[0];

  const socket = net.createConnection({
    host: ip,
    port: 587,
    family: 4,
    timeout: 10000
  });

  socket.on('connect', () => {
    console.log(`[GMAIL IPV4 CONNECTION] SUCCESS ${ip}:587`);
    socket.destroy();
  });

  socket.on('timeout', () => {
    console.error(`[GMAIL IPV4 CONNECTION] TIMEOUT ${ip}:587`);
    socket.destroy();
  });

  socket.on('error', (error) => {
    console.error('[GMAIL IPV4 CONNECTION] ERROR', error);
  });
});
// Everything else below this
require('dotenv').config();

// your existing imports below
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initSchema, dbHelper } = require('./database/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const contractorRoutes = require('./routes/contractorRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/contractor', contractorRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    institution: 'Maharashtra Institute of Technology (MIT), Chhatrapati Sambhajinagar',
    system: 'Smart E-Tender Management System & AI Procurement Assistant',
    security_features: [
      'Strict Password Policy (8+ chars, upper, lower, digit, special)',
      'Account Lockout (5 consecutive failed attempts -> 15 min lock)',
      'Rate Limiting on Authentication Endpoints',
      'Hashed Cryptographic OTPs (never exposed in API)',
      'Controlled Institutional Role Approvals',
      'JWT Authentication without fallback secrets'
    ],
    timestamp: new Date().toISOString(),
    version: '2.1.0'
  });
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server and ensure DB schema is initialized
const startServer = async () => {
  try {
    await initSchema();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n========================================================================`);
      console.log(`  MAHARASHTRA INSTITUTE OF TECHNOLOGY (MIT), CHHATRAPATI SAMBHAJINAGAR`);
      console.log(`  SMART E-TENDER SYSTEM ACTIVE [ENTERPRISE SECURITY ENABLED]`);
      console.log(`  SERVER LISTENING ON PORT: ${PORT}`);
      console.log(`========================================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
