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

  static async getAllProperties(listingType = null) {
    let query = `
      SELECT property_id as id, title, type, status, price, area, bedrooms, bathrooms, locality as location, city, image, images, tag, is_rera, furnishing_status, has_parking, has_power_backup, has_elevator, listing_type, year_built, dist_metro_km, dist_highway_km, dist_bus_km, has_pool, has_gym, has_clubhouse, has_sports_ground
      FROM properties
    `;
    const params = [];
    if (listingType) {
      query += ` WHERE listing_type = $1`;
      params.push(listingType);
    }
    query += ` ORDER BY property_id ASC;`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getPropertiesByUserId(userId) {
    const query = `
      SELECT property_id as id, title, type, status, price, area, bedrooms, bathrooms, locality as location, city, image, images, tag, is_rera, open_to_swap
      FROM properties
      WHERE owner_id = $1
      ORDER BY property_id DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async createProperty(data) {
    const query = `
      INSERT INTO properties (
        owner_id, title, city, locality, street_address, state, zip_code, 
        price, type, bedrooms, bathrooms, area, furnishing_status, 
        description, has_parking, has_power_backup, has_elevator, open_to_swap, images, listing_type
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING property_id as id, *;
    `;
    const values = [
      data.owner_id, data.title, data.city, data.locality, data.street_address, data.state, data.zip_code,
      data.price, data.type, data.bedrooms, data.bathrooms, data.area, data.furnishing_status,
      data.description, data.has_parking, data.has_power_backup, data.has_elevator, data.open_to_swap, 
      data.images ? JSON.stringify(data.images) : '[]', data.listing_type || 'sale'
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = PropertyModel;
