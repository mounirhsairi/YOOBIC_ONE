import { connectDatabase } from './sequelize';
import { seedDatabase } from './seed';

const run = async () => {
  try {
    console.log('[SeedRunner] Connecting database and running seed...');
    await connectDatabase();
    await seedDatabase();
    console.log('[SeedRunner] Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[SeedRunner] Seeding failed:', error);
    process.exit(1);
  }
};

run();
