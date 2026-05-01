const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const { initSockets } = require('./sockets/socketHandler');
const transactionService = require('./services/transactionService');
const pool = require('./config/db');

const swapRoutes = require('./routes/swapRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSockets(server);

// Initialize AI Model Scheduler (runs at 12 AM / 12 PM)
const { initMarketInsightsScheduler } = require('./services/marketInsightsScheduler');
initMarketInsightsScheduler();

// Middleware
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'NexusEstate Backend' });
});

// ──────────────────────────────────────────────
// Standard REST Routes
// ──────────────────────────────────────────────
app.use('/api/swaps', swapRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));

// Custom endpoint for Live Trigger Demo
const listingController = require('./controllers/listingController');
app.post('/api/listings/create-swap', listingController.createPropertyAndSwap);

// ──────────────────────────────────────────────
// Bridge: Cycle Detection (Node → Python Swap Engine)
// Fetches active swap requests from DB, forwards to Python
// graph engine (port 8001) for cycle detection.
// ──────────────────────────────────────────────
app.post('/api/cycles/detect', async (req, res) => {
  console.log('--- START CYCLE DETECTION ---');
  try {
    const query = `
      SELECT
        sr.id,
        sr.user_id,
        p.city AS current_city,
        sr.desired_city,
        sr.desired_window::TEXT AS desired_window
      FROM Swap_Requests sr
      JOIN Properties p ON sr.current_property_id = p.property_id
      WHERE sr.is_active = TRUE
    `;
    const result = await pool.query(query);
    console.log(`Step 1: Found ${result.rows.length} active requests in DB.`);

    const SWAP_ENGINE_URL = process.env.SWAP_ENGINE_URL || 'http://localhost:8001';
    console.log('Step 2: Sending data to Python Swap Engine...');
    const response = await axios.post(`${SWAP_ENGINE_URL}/api/cycles/detect`, {
      requests: result.rows,
    });

    console.log('Step 3: Python returned:', response.data);
    res.json({
      ...response.data,
      nodes: result.rows
    });
  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// Bridge: Multi-Party Swap Execution
// Called after graph engine detects a valid cycle.
// Runs full ACID-compliant transaction with row-level locking.
// ──────────────────────────────────────────────
app.post('/api/swaps/execute', async (req, res) => {
  const { cycleSwapRequestIds } = req.body;

  if (!cycleSwapRequestIds || !Array.isArray(cycleSwapRequestIds) || cycleSwapRequestIds.length < 2) {
    return res.status(400).json({ error: 'Invalid cycle data provided' });
  }

  try {
    const result = await transactionService.executeMultiPartySwap(pool, cycleSwapRequestIds);
    res.status(200).json({
      message: 'Multi-party swap executed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Swap Execution Failed:', error);
    res.status(500).json({
      error: 'Swap execution failed. Transaction rolled back.',
      details: error.message,
    });
  }
});

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`NexusEstate Backend running on port ${PORT}`);
});
