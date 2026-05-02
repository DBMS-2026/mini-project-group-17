const pool = require('../config/db');

// POST /api/ratings — submit or update a rating
const submitRating = async (req, res) => {
  const { property_id, user_id, rating } = req.body;
  if (!property_id || !user_id || !rating) {
    return res.status(400).json({ error: 'property_id, user_id, rating required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }
  try {
    // Upsert: update if already rated, insert if not
    await pool.query(
      `INSERT INTO property_ratings (property_id, user_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (property_id, user_id) DO UPDATE SET rating = EXCLUDED.rating`,
      [property_id, user_id, rating]
    );

    // Recalculate avg and count on properties table
    const stats = await pool.query(
      `SELECT ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS rating_count
       FROM property_ratings WHERE property_id = $1`,
      [property_id]
    );
    const { avg_rating, rating_count } = stats.rows[0];
    await pool.query(
      `UPDATE properties SET avg_rating=$1, rating_count=$2 WHERE property_id=$3`,
      [avg_rating, rating_count, property_id]
    );

    res.json({ avg_rating: parseFloat(avg_rating), rating_count: parseInt(rating_count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ratings/:propertyId — get rating summary + user's own rating
const getPropertyRating = async (req, res) => {
  const { propertyId } = req.params;
  const { userId } = req.query;
  try {
    const stats = await pool.query(
      `SELECT avg_rating, rating_count FROM properties WHERE property_id = $1`,
      [propertyId]
    );
    let userRating = null;
    if (userId) {
      const ur = await pool.query(
        `SELECT rating FROM property_ratings WHERE property_id=$1 AND user_id=$2`,
        [propertyId, userId]
      );
      userRating = ur.rows[0]?.rating ?? null;
    }
    res.json({
      avg_rating: parseFloat(stats.rows[0]?.avg_rating || 0),
      rating_count: parseInt(stats.rows[0]?.rating_count || 0),
      user_rating: userRating,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { submitRating, getPropertyRating };
