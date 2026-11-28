import mongoose from 'mongoose';

import { logger } from '@/lib/logger';

import { requireEnv } from './env';

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
 * Uses `requireEnv()` rather than `getENV()` so scripts can connect without the bot's other variables.
 */
export const connectDatabase = async () => {
  const databaseKey = process.env.STAGING ? 'MONGODB_DB_TEST' : 'MONGODB_DB';
  const { MONGODB_URL, [databaseKey]: databaseName } = requireEnv(
    'MONGODB_URL',
    databaseKey,
  );

  const dbURL = `${MONGODB_URL}/${databaseName}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(dbURL);
    logger.info({ database: databaseName }, 'Database connected');
    addConnectionListeners();
  } catch (error) {
    logger.fatal({ err: error }, 'Database connection failed');
    process.exit(1);
  }
};
