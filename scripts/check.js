const { Client } = require('pg');
const cs = 'postgresql://postgres:Ritawik%401995_2@db.qdaccndowszbytbwkybs.supabase.co:5432/postgres';
(async () => {
  const c = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const tables = await c.query(`select table_schema, table_name from information_schema.tables where table_schema='public' order by 2`);
  console.log('Public tables:');
  tables.rows.forEach(r => console.log(' -', r.table_name));
  const fns = await c.query(`select proname from pg_proc where pronamespace=(select oid from pg_namespace where nspname='public') and proname like '%nearby%'`);
  console.log('\nFunctions:'); fns.rows.forEach(r => console.log(' -', r.proname));
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
