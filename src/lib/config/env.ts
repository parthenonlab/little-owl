import { logger } from '@/lib/logger';

const REQUIRED_ENV = [
  'ADMIN_SERVER_ID',
  'CHANNELS',
  'DISCORD_CLIENT_ID',
  'DISCORD_TOKEN',
  'MONGODB_URL',
  'SERVER_ID',
  'TWITCH_CLIENT_ID',
  'TWITCH_CLIENT_SECRET',
  'USERNAME',
] as const;

type Env = Readonly<
  Record<(typeof REQUIRED_ENV)[number] | 'MONGODB_DB', string>
>;

let env: Env | undefined;

/**
 * Read the given environment variables.
 * Logs every missing name and exits the process if any are unset.
 * Scripts use this directly to require only what they need.
 *
 * @param names - Environment variable names to read.
 * @returns Object mapping each name to its value.
 */
export const requireEnv = <K extends string>(
  ...names: K[]
): Record<K, string> => {
  const missing = names.filter(name => !process.env[name]);

  if (missing.length > 0) {
    logger.fatal({ missing }, 'Missing required environment variables');
    process.exit(1);
  }

  return Object.fromEntries(
    names.map(name => [name, process.env[name]]),
  ) as Record<K, string>;
};

/**
 * Return every environment variable the bot requires, validated on first call.
 * `MONGODB_DB` resolves to `MONGODB_DB_TEST` when `STAGING` is set.
 * Exits the process if any are missing.
 *
 * @returns Frozen object containing all required environment variable values.
 */
export const getENV = (): Env => {
  if (env) return env;

  const databaseKey = process.env.STAGING ? 'MONGODB_DB_TEST' : 'MONGODB_DB';
  const values = requireEnv(...REQUIRED_ENV, databaseKey);

  env = Object.freeze({ ...values, MONGODB_DB: values[databaseKey] });

  return env;
};
