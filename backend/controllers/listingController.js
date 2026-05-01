const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'nexusestate',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

exports.createPropertyAndSwap = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, title, city, price, locality, desiredCity, desiredWindow } = req.body;

    // We must start a transaction to ensure if the swap fails, the property is not left orphaned.
    await client.query('BEGIN');

    // 1. Insert Property (This fires Trigger 1 to auto-flag if price is too low)
    const propQuery = `
      INSERT INTO properties (owner_id, title, city, price, locality)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING property_id, is_fraud_flagged
    `;
    const propValues = [userId || 1, title, city, price, locality];
    const propResult = await client.query(propQuery, propValues);
    const newProperty = propResult.rows[0];

    // 2. Insert Swap Request (This fires Trigger 2, which BLOCKS the insert if flagged)
    const swapQuery = `
      INSERT INTO swap_requests (user_id, current_property_id, desired_city, desired_window)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const swapValues = [userId || 1, newProperty.property_id, desiredCity, desiredWindow || '2026-06-01'];
    await client.query(swapQuery, swapValues);

    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Property listed and swap request opened successfully!',
      property: newProperty
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction Failed:', err.message);
    
    // Check if this is our custom Trigger Exception
    if (err.code === '23514' || err.message.includes('fraud-flagged')) { // check_violation code
       return res.status(403).json({
           success: false,
           errorType: 'DATABASE_TRIGGER_ERROR',
           message: err.message
       });
    }

    res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  } finally {
    client.release();
  }
};
