const pool = require('./config/db');

async function migrate() {
  console.log('Creating property_inquiries table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS property_inquiries (
      id          SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
      buyer_id    INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      owner_id    INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      message     TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✓ property_inquiries created');

  console.log('Creating property_ratings table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS property_ratings (
      id          SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
      user_id     INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(property_id, user_id)
    );
  `);
  console.log('✓ property_ratings created');

  console.log('Adding rating columns to properties...');
  await pool.query(`
    ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS year_built INTEGER,
      ADD COLUMN IF NOT EXISTS furnishing VARCHAR(50) DEFAULT 'Unfurnished',
      ADD COLUMN IF NOT EXISTS parking BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS elevator BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS power_backup BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS facing VARCHAR(30);
  `);
  console.log('✓ properties columns added');

  console.log('\nAll migrations complete!');
  process.exit(0);
}

migrate().catch(err => { console.error(err.message); process.exit(1); });
