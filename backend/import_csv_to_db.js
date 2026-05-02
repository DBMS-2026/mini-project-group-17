const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nexusestate',
  password: process.env.DB_PASSWORD || '12345678',
  port: process.env.DB_PORT || 5432,
});

const CSV_PATH = path.join(__dirname, '../ai-service/kaggle_indian_housing_25_cities.csv');

const TYPES = ['apartment', 'villa', 'builder-floor'];
const STATUSES = ['ready-to-move', 'under-construction', 'new-launch'];
const IMAGES = [
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687931-cebf004f9f4a?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80'
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  const cityCounts = {};
  const maxPerCity = 50;
  const propertiesToInsert = [];

  console.log("Reading CSV from:", CSV_PATH);
  
  if (!fs.existsSync(CSV_PATH)) {
    console.error("CSV file not found!");
    process.exit(1);
  }

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        const c = row.city;
        if (!cityCounts[c]) cityCounts[c] = 0;
        
        if (cityCounts[c] < maxPerCity) {
          propertiesToInsert.push(row);
          cityCounts[c]++;
        }
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });

  console.log(`Extracted ${propertiesToInsert.length} properties from Kaggle dataset.`);
  console.log("Wiping current properties table...");

  try {
    try { await pool.query('DELETE FROM leases'); } catch(e) {}
    await pool.query('DELETE FROM properties');
    console.log("Properties table cleared.");

    const userRes = await pool.query(`SELECT user_id FROM users LIMIT 1;`);
    let ownerId = 1;
    if (userRes.rows.length > 0) {
      ownerId = userRes.rows[0].user_id;
    } else {
      const newUser = await pool.query(`INSERT INTO users (full_name, email, role) VALUES ('Nexus Admin', 'admin@nexus.com', 'Investor') RETURNING user_id;`);
      ownerId = newUser.rows[0].user_id;
    }

    console.log("Inserting properties into PostgreSQL...");

    let inserted = 0;
    for (const row of propertiesToInsert) {
      const bhk = parseInt(row.bedrooms, 10) || 1;
      const type = randomChoice(TYPES);
      const title = `${bhk} BHK ${type.charAt(0).toUpperCase() + type.slice(1)} in ${row.city} Central`;

      const q = `
        INSERT INTO properties (
          owner_id, city, locality, title, type, status, price, area, bedrooms, bathrooms,
          dist_metro_km, dist_highway_km, dist_bus_km, year_built,
          has_pool, has_gym, has_clubhouse, has_sports_ground,
          image, images, listing_type
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18,
          $19, $20, $21
        )
      `;
      const v = [
        ownerId,
        row.city,
        `${row.city} Central`,
        title,
        type,
        randomChoice(STATUSES),
        parseFloat(row.price),
        parseFloat(row.square_feet),
        bhk,
        parseInt(row.bathrooms, 10) || 1,
        parseFloat(row.dist_metro_km),
        parseFloat(row.dist_highway_km),
        parseFloat(row.dist_bus_km),
        parseInt(row.year_built, 10),
        row.has_swimming_pool === '1',
        row.has_gym === '1',
        row.has_clubhouse === '1',
        row.has_sports_ground === '1',
        randomChoice(IMAGES),
        JSON.stringify([randomChoice(IMAGES), randomChoice(IMAGES)]),
        'sale'
      ];
      await pool.query(q, v);
      inserted++;
    }

    console.log(`Successfully inserted ${inserted} authentic Kaggle properties!`);
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    pool.end();
  }
}

run();
