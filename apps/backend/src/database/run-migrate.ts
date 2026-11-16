import { connectDatabase } from './sequelize';

const run = async () => {
  try {
    console.log('[Migrate] Connecting and syncing database schema...');
    await connectDatabase();
    console.log('[Migrate] Database schema synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Migrate] Migration failed:', error);
    process.exit(1);
  }
};

run();
