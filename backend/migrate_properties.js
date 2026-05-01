const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nexusestate',
  password: 'password',
  port: 5432,
});

async function runMigration() {
  try {
    console.log("Starting properties table migration...");

    // 1. Add missing columns
    await pool.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS locality VARCHAR(150),
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'apartment',
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ready-to-move',
      ADD COLUMN IF NOT EXISTS bedrooms INT DEFAULT 2,
      ADD COLUMN IF NOT EXISTS bathrooms INT DEFAULT 2,
      ADD COLUMN IF NOT EXISTS area INT DEFAULT 1000,
      ADD COLUMN IF NOT EXISTS image VARCHAR(500),
      ADD COLUMN IF NOT EXISTS tag VARCHAR(50),
      ADD COLUMN IF NOT EXISTS is_rera BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS dist_metro_km NUMERIC(5,2) DEFAULT 5.0,
      ADD COLUMN IF NOT EXISTS dist_highway_km NUMERIC(5,2) DEFAULT 10.0,
      ADD COLUMN IF NOT EXISTS has_pool BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS has_gym BOOLEAN DEFAULT FALSE;
    `);

    console.log("Added new columns.");

    // 2. Populate mock data for the 8 existing properties based on their cities
    const updates = [
      { id: 1, title: 'Lodha World One', loc: 'Lower Parel', type: 'apartment', status: 'ready-to-move', beds: 4, baths: 4, area: 2500, img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', tag: 'FEATURED', rera: true },
      { id: 2, title: 'DLF Camellias', loc: 'Golf Course Road', type: 'apartment', status: 'ready-to-move', beds: 4, baths: 5, area: 7400, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', tag: 'HOT', rera: true },
      { id: 3, title: 'Prestige Kingfisher Towers', loc: 'Ashok Nagar', type: 'apartment', status: 'ready-to-move', beds: 3, baths: 3, area: 1800, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', tag: 'NEW LAUNCH', rera: true },
      { id: 4, title: 'Brigade Valencia', loc: 'ECR', type: 'villa', status: 'under-construction', beds: 3, baths: 3, area: 2200, img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80', tag: 'NEW ARRIVAL', rera: true },
      { id: 5, title: 'My Home Bhooja', loc: 'HITEC City', type: 'apartment', status: 'ready-to-move', beds: 3, baths: 3, area: 2600, img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80', tag: 'HOT', rera: true },
      { id: 6, title: 'Rustomjee Crown', loc: 'Prabhadevi', type: 'apartment', status: 'under-construction', beds: 2, baths: 2, area: 1100, img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', tag: 'NEW LAUNCH', rera: false },
      { id: 7, title: 'Godrej South Estate', loc: 'Okhla', type: 'apartment', status: 'ready-to-move', beds: 3, baths: 3, area: 1500, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', tag: 'FEATURED', rera: true },
      { id: 8, title: 'Panchshil Towers', loc: 'Kharadi', type: 'apartment', status: 'ready-to-move', beds: 3, baths: 3, area: 1600, img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', tag: 'HOT', rera: true }
    ];

    for (const p of updates) {
      await pool.query(`
        UPDATE properties
        SET title = $1, locality = $2, type = $3, status = $4, bedrooms = $5, bathrooms = $6, area = $7, image = $8, tag = $9, is_rera = $10
        WHERE property_id = $11
      `, [p.title, p.loc, p.type, p.status, p.beds, p.baths, p.area, p.img, p.tag, p.rera, p.id]);
    }

    console.log("Updated sample data.");

    // 3. Fix user roles while we're at it so UI doesn't break
    await pool.query(`UPDATE users SET role = 'Nomad' WHERE role IS NULL`);

  } catch (error) {
    console.error("Migration Error:", error);
  } finally {
    pool.end();
  }
}

runMigration();
