const pool = require('./config/db');

async function migrate() {
  try {
    await pool.query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type VARCHAR(50) DEFAULT 'sale';");
    // Update existing records - some rent, some sale based on price to look realistic
    await pool.query("UPDATE properties SET listing_type = 'rent' WHERE price < 100000;");
    await pool.query("UPDATE properties SET listing_type = 'sale' WHERE price >= 100000;");
    console.log("Migration successful: added listing_type to properties table.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
