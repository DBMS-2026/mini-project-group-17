const pool = require('./config/db');
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
  .then(r => { console.log('Tables:', r.rows.map(x => x.table_name)); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
