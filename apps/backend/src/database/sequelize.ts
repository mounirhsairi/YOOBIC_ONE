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
const databaseUrl = process.env.DATABASE_URL;

// Dialect resolution:
// 1. If DATABASE_URL is set (Render, Neon, Supabase, Cloud DB)
// 2. Otherwise sqlite or mysql based on DB_DIALECT
const explicitDialect = (process.env.DB_DIALECT || '').toLowerCase();
let dbDialect: 'mysql' | 'sqlite' | 'postgres' = isTest
  ? 'sqlite'
  : databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))
    ? 'postgres'
    : explicitDialect === 'sqlite'
      ? 'sqlite'
      : 'mysql';

let sequelizeConfig: Options;

if (databaseUrl) {
  const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');
  dbDialect = isPostgres ? 'postgres' : 'mysql';
  sequelizeConfig = {
    dialect: isPostgres ? 'postgres' : 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: isPostgres
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {
          connectTimeout: 15000,
        },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      freezeTableName: true,
    },
  };
  console.log(`[Database] Connecting via DATABASE_URL (${dbDialect})`);
} else if (dbDialect === 'sqlite') {
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

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, sequelizeConfig)
  : new Sequelize(sequelizeConfig);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connection established successfully via ${dbDialect}.`);

    // 1. Pre-sync migration: add columns BEFORE sequelize.sync() runs, so indexes/constraints don't fail!
    try {
      if (dbDialect === 'postgres') {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS "form_templates" (
            "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "organizationId" UUID NOT NULL,
            "title" VARCHAR(255) NOT NULL,
            "description" TEXT,
            "category" VARCHAR(100) DEFAULT 'OPERATIONS',
            "pages" JSONB DEFAULT '[]'::jsonb,
            "estimatedDurationMinutes" INTEGER,
            "isActive" BOOLEAN DEFAULT true,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
        await sequelize.query('ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "formTemplateId" UUID;');
        await sequelize.query('ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "formProgress" JSONB;');
        await sequelize.query('ALTER TABLE "form_templates" ADD COLUMN IF NOT EXISTS "pages" JSONB DEFAULT \'[]\'::jsonb;');
        await sequelize.query('ALTER TABLE "form_templates" ADD COLUMN IF NOT EXISTS "estimatedDurationMinutes" INTEGER;');
        await sequelize.query('CREATE INDEX IF NOT EXISTS "tasks_form_template_id" ON "tasks" ("formTemplateId");');
        console.log('[Database] PostgreSQL pre-sync schema verified.');
      } else if (dbDialect === 'sqlite') {
        try {
          await sequelize.query('ALTER TABLE tasks ADD COLUMN formTemplateId TEXT;');
        } catch {}
        try {
          await sequelize.query('ALTER TABLE tasks ADD COLUMN formProgress TEXT;');
        } catch {}
      }
    } catch (migErr: any) {
      console.warn('[Database] Pre-sync schema check notice:', migErr.message);
    }

    // 2. Synchronize schema if tables are missing
    await sequelize.sync({ alter: false });
    console.log('[Database] Schema synchronized.');
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
    }
    console.error('  Error:', error?.message || error);
    console.error('══════════════════════════════════════════════════════════');
    console.error('');
    throw error;
  }
};

export const getDialect = () => dbDialect;
