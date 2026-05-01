const pool = require('./config/db');

async function fix() {
  // Fix: kd's 2nd villa was intended as rent, restore it
  const r = await pool.query(
    "UPDATE properties SET listing_type = 'rent' WHERE title ILIKE '%2nd villa%' OR title ILIKE '%kd%villa%'"
  );
  console.log('Fixed', r.rowCount, 'rows back to rent');

  // Verify
  const verify = await pool.query('SELECT property_id, title, listing_type FROM properties ORDER BY property_id DESC');
  console.log('\nAll properties:');
  verify.rows.forEach(row => console.log(`  [${row.listing_type}] ${row.title}`));
  process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });
