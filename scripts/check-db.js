#!/usr/bin/env node
/**
 * Quick connectivity check for the configured database.
 * Usage: node scripts/check-db.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const dialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();

async function main() {
  if (dialect === 'sqlite') {
    console.log('DB_DIALECT=sqlite — no network check needed.');
    process.exit(0);
  }

  const mysql = require('mysql2/promise');
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'yoobic',
    password: process.env.DB_PASSWORD || 'yoobic_secret',
    database: process.env.DB_NAME || 'yoobic_one',
    connectTimeout: 8000,
  };

  console.log(`Checking MySQL at ${config.user}@${config.host}:${config.port}/${config.database} ...`);
  try {
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.query('SELECT 1 AS ok, VERSION() AS version');
    console.log('✓ Connected successfully');
    console.log('  MySQL version:', rows[0].version);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
    console.error('');
    console.error('Start MySQL with:  docker compose up -d mysql');
    process.exit(1);
  }
}

main();
