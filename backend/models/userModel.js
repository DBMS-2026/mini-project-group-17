const pool = require('../config/db');

exports.upsertUser = async (email, name, role) => {
  const query = `
    INSERT INTO Users (email, name, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (email)
    DO UPDATE SET name = EXCLUDED.name
    RETURNING user_id as id, email, name as full_name, role;
  `;
  const result = await pool.query(query, [email, name, role]);
  return result.rows[0];
};

exports.createUser = async (email, name, passwordHash, role) => {
  const query = `
    INSERT INTO Users (email, name, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id as id, email, name as full_name, role;
  `;
  const result = await pool.query(query, [email, name, passwordHash, role]);
  return result.rows[0];
};

exports.getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT user_id as id, email, name as full_name, role, password_hash FROM Users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

exports.getUserById = async (id) => {
  const result = await pool.query(
    'SELECT user_id as id, email, name as full_name, role FROM Users WHERE user_id = $1',
    [id]
  );
  return result.rows[0];
};
