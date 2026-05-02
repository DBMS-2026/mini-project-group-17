const pool = require('../config/db');

/**
 * GET /api/users
 * Returns all registered users with basic fields.
 */
async function getAllUsers(req, res) {
  try {
    const query = `
      SELECT
        user_id AS id,
        name,
        email,
        created_at
      FROM users
      ORDER BY user_id ASC;
    `;
    const { rows } = await pool.query(query);
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error('❌ getAllUsers error →', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllUsers };
