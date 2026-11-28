import mongoose from 'mongoose';

import { logger } from '@/lib/logger';

/** Log connection drops and recoveries after the initial connect. */
const addConnectionListeners = () => {
  const { connection } = mongoose;

  connection.on('disconnected', () => logger.warn('Database connection lost'));
  connection.on('reconnected', () => logger.info('Database reconnected'));
  connection.on('error', error =>
    logger.error({ err: error }, 'Database connection error'),
  );
};

/**
 * Connect to MongoDB using environment variables.
 * Selects the test database when STAGING is set, otherwise production.
 * Exits the process on missing config or connection failure.
 */
export const connectDatabase = async () => {
  const mongodbURL = process.env.MONGODB_URL;
  const databaseName = process.env.STAGING
    ? process.env.MONGODB_DB_TEST
    : process.env.MONGODB_DB;

  if (!mongodbURL || !databaseName) {
    logger.fatal('MongoDB missing environment variables');
    process.exit(1);
  }

  const dbURL = `${mongodbURL}/${databaseName}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(dbURL);
    logger.info({ database: databaseName }, 'Database connected');
    addConnectionListeners();
  } catch (error) {
    logger.fatal({ err: error }, 'Database connection failed');
    process.exit(1);
  }
};
