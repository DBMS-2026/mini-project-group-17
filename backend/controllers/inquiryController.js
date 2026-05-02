const pool = require('../config/db');

// POST /api/inquiries — buyer sends interest
const sendInquiry = async (req, res) => {
  const { property_id, buyer_id, owner_id, message } = req.body;
  if (!property_id || !buyer_id || !owner_id) {
    return res.status(400).json({ error: 'property_id, buyer_id, owner_id required' });
  }
  try {
    // Prevent duplicate pending inquiry
    const existing = await pool.query(
      `SELECT id FROM property_inquiries WHERE property_id=$1 AND buyer_id=$2 AND status='pending'`,
      [property_id, buyer_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already sent an interest request for this property.' });
    }
    const result = await pool.query(
      `INSERT INTO property_inquiries (property_id, buyer_id, owner_id, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [property_id, buyer_id, owner_id, message || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/inquiries/owner/:userId — all inquiries for properties owned by user
const getOwnerInquiries = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT pi.*, 
              p.title AS property_title,
              u.name AS buyer_name,
              u.email AS buyer_email
       FROM property_inquiries pi
       JOIN properties p ON pi.property_id = p.property_id
       JOIN users u ON pi.buyer_id = u.user_id
       WHERE pi.owner_id = $1
       ORDER BY pi.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/inquiries/buyer/:userId — all inquiries sent by buyer
const getBuyerInquiries = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT pi.*,
              p.title AS property_title,
              p.city  AS property_city,
              u.name  AS owner_name,
              CASE WHEN pi.status = 'accepted' THEN u.email ELSE NULL END AS owner_email
       FROM property_inquiries pi
       JOIN properties p ON pi.property_id = p.property_id
       JOIN users u ON pi.owner_id = u.user_id
       WHERE pi.buyer_id = $1
       ORDER BY pi.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/inquiries/:id — owner accepts or rejects
const updateInquiryStatus = async (req, res) => {
  const { id } = req.params;
  const { status, owner_id } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be accepted or rejected' });
  }
  try {
    const result = await pool.query(
      `UPDATE property_inquiries SET status=$1
       WHERE id=$2 AND owner_id=$3 RETURNING *`,
      [status, id, owner_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found or not authorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendInquiry, getOwnerInquiries, getBuyerInquiries, updateInquiryStatus };
