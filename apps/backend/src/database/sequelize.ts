import { Sequelize, Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const dbDialect = (process.env.DB_DIALECT || (isTest ? 'sqlite' : 'mysql')) as 'mysql' | 'sqlite';

let sequelizeConfig: Options;

if (dbDialect === 'sqlite') {
  sequelizeConfig = {
    dialect: 'sqlite',
    storage: isTest ? ':memory:' : (process.env.SQLITE_STORAGE || './dev_database.sqlite'),
    logging: false,
  };
} else {
  sequelizeConfig = {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'yoobic',
    password: process.env.DB_PASSWORD || 'yoobic_secret',
    database: process.env.DB_NAME || 'yoobic_one',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
}

export const sequelize = new Sequelize(sequelizeConfig);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connection has been established successfully via ${dbDialect}.`);
    
    // Auto-sync schema in test/dev
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      console.log('[Database] Schema synchronized.');
    }
  } catch (error) {
    console.error('[Database] Unable to connect to the database:', error);
    throw error;
  }
};
