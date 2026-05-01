const pool = require('../config/db');

class PropertyModel {
  static async getPropertyById(id) {
    const query = `
      SELECT property_id as id, title, type, status, price, area as sqft, bedrooms as bhk, bathrooms, locality as location, city, dist_metro_km, dist_highway_km, has_pool, has_gym, image, tag, is_rera
      FROM properties
      WHERE property_id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAllProperties() {
    const query = `
      SELECT property_id as id, title, type, status, price, area, bedrooms, bathrooms, locality as location, city, image, tag, is_rera
      FROM properties
      ORDER BY property_id ASC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = PropertyModel;
