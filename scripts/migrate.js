// Runs supabase/schema.sql against the Supabase Postgres database.
// Usage:  node scripts/migrate.js
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:Ritawik%401995_2@db.qdaccndowszbytbwkybs.supabase.co:5432/postgres';

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  console.log('Connecting to Supabase Postgres…');
  await client.connect();
  console.log('Connected. Running schema.sql…');
  try {
    await client.query(sql);
    console.log('✅ Schema applied successfully.');
  } catch (err) {
    console.error('❌ Schema failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
