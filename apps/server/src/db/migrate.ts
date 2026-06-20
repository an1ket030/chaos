import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

async function migrate(): Promise<void> {
  console.log('🔄 Running database migration...');
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
  console.log('✅ Migration complete!');
  await pool.end();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
