import { Sequelize, Options } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Resolve .env from monorepo root (works whether cwd is root or apps/backend)
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(__dirname, '../../../.env'),
];
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config(); // fallback

const isTest = process.env.NODE_ENV === 'test';

// MySQL is the primary dialect.
// SQLite is used only for tests or when DB_DIALECT=sqlite is set explicitly.
const explicitDialect = (process.env.DB_DIALECT || '').toLowerCase();
const dbDialect: 'mysql' | 'sqlite' = isTest
  ? 'sqlite'
  : explicitDialect === 'sqlite'
    ? 'sqlite'
    : 'mysql';

let sequelizeConfig: Options;

if (dbDialect === 'sqlite') {
  const storage = isTest
    ? ':memory:'
    : process.env.SQLITE_STORAGE || path.resolve(process.cwd(), 'dev_database.sqlite');
  sequelizeConfig = {
    dialect: 'sqlite',
    storage,
    logging: false,
  };
  console.log(`[Database] Using SQLite → ${storage}`);
} else {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const username = process.env.DB_USER || 'yoobic';
  const password = process.env.DB_PASSWORD ?? 'yoobic_secret';
  const database = process.env.DB_NAME || 'yoobic_one';

  sequelizeConfig = {
    dialect: 'mysql',
    host,
    port,
    username,
    password,
    database,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      connectTimeout: 15000,
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      freezeTableName: true,
    },
  };

  console.log(`[Database] Using MySQL → ${username}@${host}:${port}/${database}`);
}

export const sequelize = new Sequelize(sequelizeConfig);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connection established successfully via ${dbDialect}.`);

    if (process.env.NODE_ENV !== 'production') {
      // Create missing tables. Does not drop existing data.
      await sequelize.sync({ alter: true });
      console.log('[Database] Schema synchronized (alter:true in non-production).');
    }
  } catch (error: any) {
    console.error('');
    console.error('══════════════════════════════════════════════════════════');
    console.error('  DATABASE CONNECTION FAILED');
    console.error('══════════════════════════════════════════════════════════');
    console.error(`  Dialect : ${dbDialect}`);
    if (dbDialect === 'mysql') {
      console.error(`  Host    : ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
      console.error(`  User    : ${process.env.DB_USER || 'yoobic'}`);
      console.error(`  Database: ${process.env.DB_NAME || 'yoobic_one'}`);
      console.error('');
      console.error('  → Start MySQL with Docker:');
      console.error('      docker compose up -d mysql');
      console.error('  → Wait ~30s for healthcheck, then restart the backend.');
      console.error('');
      console.error('  → Or switch temporarily to SQLite for local-only work:');
      console.error('      DB_DIALECT=sqlite npm run dev:backend');
    }
    console.error('  Error:', error?.message || error);
    console.error('══════════════════════════════════════════════════════════');
    console.error('');
    throw error;
  }
};

export const getDialect = () => dbDialect;
