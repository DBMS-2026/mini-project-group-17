const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nexusestate',
  password: process.env.DB_PASSWORD || '12345678',
  port: process.env.DB_PORT || 5432,
});

const CITIES = ['Agra', 'Ahmedabad', 'Bangalore', 'Bhopal', 'Chandigarh', 'Chennai', 'Delhi', 'Ghaziabad', 'Gurgaon', 'Hyderabad', 'Indore', 'Jaipur', 'Kanpur', 'Kolkata', 'Lucknow', 'Ludhiana', 'Mumbai', 'Nagpur', 'Nashik', 'Noida', 'Patna', 'Pune', 'Ranchi', 'Surat', 'Vadodara'];

const TYPES = ['apartment', 'villa', 'builder-floor', 'studio'];
const STATUSES = ['ready-to-move', 'under-construction', 'new-launch'];
const TAGS = ['NEW LAUNCH', 'HOT', 'FEATURED', 'NEW ARRIVAL', null, null];
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  try {
    console.log("Altering table to add ML dataset columns...");
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built INT DEFAULT 2015;`);
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS dist_bus_km NUMERIC(5,2) DEFAULT 2.0;`);
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_clubhouse BOOLEAN DEFAULT false;`);
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_sports_ground BOOLEAN DEFAULT false;`);
    console.log("Table altered successfully.");

    // Ensure we have a default user (owner_id = 1)
    const userRes = await pool.query(`SELECT user_id FROM users LIMIT 1;`);
    let ownerId = 1;
    if (userRes.rows.length > 0) {
      ownerId = userRes.rows[0].user_id;
    } else {
      console.log("No users found. Creating a default owner...");
      const newUser = await pool.query(`INSERT INTO users (full_name, email, role) VALUES ('Nexus Admin', 'admin@nexus.com', 'Investor') RETURNING user_id;`);
      ownerId = newUser.rows[0].user_id;
    }

    console.log("Generating 20 properties for each of the 25 cities (500 total)...");
    
    let inserted = 0;
    
    for (const city of CITIES) {
      for (let i = 0; i < 20; i++) {
        const type = randomChoice(TYPES);
        const bhk = type === 'studio' ? 1 : randomInt(1, 5);
        const bathrooms = Math.max(1, bhk - randomInt(0, 1));
        const area = bhk * randomInt(500, 800);
        const basePrice = city === 'Mumbai' || city === 'Delhi' || city === 'Bangalore' ? 10000 : 5000;
        const price = area * basePrice * randomFloat(0.8, 1.5);
        const title = `${bhk} BHK ${type.charAt(0).toUpperCase() + type.slice(1)} in ${city} Central`;
        
        const q = `
          INSERT INTO properties (
            owner_id, city, locality, title, type, status, price, area, bedrooms, bathrooms,
            dist_metro_km, dist_highway_km, dist_bus_km, year_built,
            has_pool, has_gym, has_clubhouse, has_sports_ground,
            image, images, tag, listing_type
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14,
            $15, $16, $17, $18,
            $19, $20, $21, $22
          )
        `;
        
        const v = [
          ownerId,
          city,
          `${city} Central`,
          title,
          type,
          randomChoice(STATUSES),
          price,
          area,
          bhk,
          bathrooms,
          randomFloat(0.5, 15.0),
          randomFloat(1.0, 20.0),
          randomFloat(0.1, 5.0),
          randomInt(2000, 2025),
          Math.random() > 0.5,
          Math.random() > 0.3,
          Math.random() > 0.6,
          Math.random() > 0.7,
          randomChoice(IMAGES),
          JSON.stringify([randomChoice(IMAGES), randomChoice(IMAGES)]),
          randomChoice(TAGS),
          Math.random() > 0.8 ? 'rent' : 'sale'
        ];
        
        await pool.query(q, v);
        inserted++;
      }
    }
    
    console.log(`Successfully inserted ${inserted} properties!`);

  } catch (err) {
    console.error("Seeding Error:", err);
  } finally {
    pool.end();
  }
}

seed();
