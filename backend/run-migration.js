/**
 * Migration Runner
 * Runs database migrations from the migrations folder
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const { Pool } = pg;

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'weareout',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function runMigration(migrationFile) {
  const migrationPath = join(__dirname, 'database', 'migrations', migrationFile);

  console.log(`\n📦 Running migration: ${migrationFile}`);
  console.log(`   Path: ${migrationPath}`);

  try {
    // Read migration file
    const sql = readFileSync(migrationPath, 'utf8');

    console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB`);

    // Run migration in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('   ✓ Transaction started');

      // Execute migration SQL
      await client.query(sql);
      console.log('   ✓ SQL executed successfully');

      await client.query('COMMIT');
      console.log('   ✓ Transaction committed');

      console.log(`\n✅ Migration ${migrationFile} completed successfully!\n`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('   ✗ Transaction rolled back due to error');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`\n❌ Migration ${migrationFile} failed!`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('Usage: node run-migration.js <migration-file>');
    console.error('Example: node run-migration.js 002_phase_2_5_foundation.sql');
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   WeAreOut Migration Runner            ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nDatabase: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`User: ${process.env.DB_USER}`);

  try {
    // Test database connection
    console.log('\n🔌 Testing database connection...');
    const result = await pool.query('SELECT current_database(), version()');
    console.log(`   ✓ Connected to database: ${result.rows[0].current_database}`);

    // Run migration
    await runMigration(migrationFile);

    console.log('═══════════════════════════════════════════');
    console.log('🎉 All migrations completed successfully!');
    console.log('═══════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n═══════════════════════════════════════════');
    console.error('💥 Migration failed!');
    console.error('═══════════════════════════════════════════\n');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
