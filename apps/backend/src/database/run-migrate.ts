import { DataTypes } from 'sequelize';
import { sequelize, connectDatabase } from './sequelize';

export const runSchemaMigrations = async () => {
  try {
    const dialect = sequelize.getDialect();
    console.log(`[Migration] Starting schema verification and migrations (dialect: ${dialect})...`);

    const queryInterface = sequelize.getQueryInterface();

    // 1. Ensure form_templates table exists
    const tables = await queryInterface.showAllTables();
    const tableNames = (tables as any[]).map((t) => (typeof t === 'string' ? t : t.tableName || t.name));

    console.log('[Migration] Existing tables in DB:', tableNames.join(', '));

    // 2. Check and migrate tasks table
    if (tableNames.includes('tasks')) {
      const taskCols = await queryInterface.describeTable('tasks');

      if (!taskCols.formTemplateId) {
        console.log('[Migration] Adding column "formTemplateId" to table "tasks"...');
        await queryInterface.addColumn('tasks', 'formTemplateId', {
          type: DataTypes.UUID,
          allowNull: true,
        });
        console.log('[Migration] Successfully added "formTemplateId" to "tasks".');
      } else {
        console.log('[Migration] Column "formTemplateId" already exists in "tasks".');
      }

      if (!taskCols.formProgress) {
        console.log('[Migration] Adding column "formProgress" to table "tasks"...');
        await queryInterface.addColumn('tasks', 'formProgress', {
          type: DataTypes.JSON,
          allowNull: true,
        });
        console.log('[Migration] Successfully added "formProgress" to "tasks".');
      } else {
        console.log('[Migration] Column "formProgress" already exists in "tasks".');
      }
    }

    // 3. Check and migrate form_templates table
    if (tableNames.includes('form_templates')) {
      const ftCols = await queryInterface.describeTable('form_templates');

      if (!ftCols.pages) {
        console.log('[Migration] Adding column "pages" to table "form_templates"...');
        await queryInterface.addColumn('form_templates', 'pages', {
          type: DataTypes.JSON,
          defaultValue: [],
        });
        console.log('[Migration] Successfully added "pages" to "form_templates".');
      } else {
        console.log('[Migration] Column "pages" already exists in "form_templates".');
      }

      if (!ftCols.estimatedDurationMinutes) {
        console.log('[Migration] Adding column "estimatedDurationMinutes" to table "form_templates"...');
        await queryInterface.addColumn('form_templates', 'estimatedDurationMinutes', {
          type: DataTypes.INTEGER,
          allowNull: true,
        });
        console.log('[Migration] Successfully added "estimatedDurationMinutes" to "form_templates".');
      } else {
        console.log('[Migration] Column "estimatedDurationMinutes" already exists in "form_templates".');
      }
    }

    console.log('[Migration] Schema migrations completed successfully.');
  } catch (error: any) {
    console.error('[Migration] Error during schema migration:', error);
    throw error;
  }
};

const run = async () => {
  try {
    await connectDatabase();
    await runSchemaMigrations();
    console.log('[MigrateRunner] All migrations and sync complete.');
    process.exit(0);
  } catch (err) {
    console.error('[MigrateRunner] Migration failed:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}
