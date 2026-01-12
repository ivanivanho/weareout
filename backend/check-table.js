import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'weareout',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function checkTable(tableName) {
  try {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      )`,
      [tableName]
    );
    console.log(`Table "${tableName}": ${result.rows[0].exists ? '✅ EXISTS' : '❌ DOES NOT EXIST'}`);
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error.message);
  }
}

async function main() {
  await checkTable('consumption_logs');
  await checkTable('purchase_history');
  await checkTable('items');
  await checkTable('shopping_list');
  await pool.end();
}

main();
