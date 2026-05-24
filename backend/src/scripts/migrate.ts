import sequelize from '../config/database';
import logger from '../utils/logger';

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });

    logger.info('✅ Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
