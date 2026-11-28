jest.mock('@/lib/logger', () => ({ logger: { fatal: jest.fn() } }));

import { logger } from '@/lib/logger';

const REQUIRED = {
  ADMIN_SERVER_ID: 'admin',
  CHANNELS: '#athena',
  DISCORD_CLIENT_ID: 'client',
  DISCORD_TOKEN: 'token',
  MONGODB_URL: 'mongodb://localhost',
  SERVER_ID: 'server',
  TWITCH_CLIENT_ID: 'twitch-client',
  TWITCH_CLIENT_SECRET: 'twitch-secret',
  USERNAME: 'littleowl',
};

/** Load a fresh copy of the module so `getENV()`'s cache starts empty. */
const loadEnv = (): typeof import('@/lib/config/env') => {
  let loaded: typeof import('@/lib/config/env') | undefined;

  jest.isolateModules(() => {
    loaded = require('@/lib/config/env');
  });

  if (!loaded) throw new Error('Failed to load env module');

  return loaded;
};

describe('env', () => {
  const env = process.env;
  const exit = jest.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('exit');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...REQUIRED, MONGODB_DB: 'prod', MONGODB_DB_TEST: 'test' };
  });

  afterAll(() => {
    process.env = env;
    exit.mockRestore();
  });

  describe('requireEnv', () => {
    it('returns the requested values', () => {
      const { requireEnv } = loadEnv();

      expect(requireEnv('SERVER_ID', 'USERNAME')).toEqual({
        SERVER_ID: 'server',
        USERNAME: 'littleowl',
      });
    });

    it('logs every missing name and exits', () => {
      delete process.env.SERVER_ID;
      process.env.USERNAME = '';
      const { requireEnv } = loadEnv();

      expect(() => requireEnv('SERVER_ID', 'USERNAME', 'CHANNELS')).toThrow(
        'exit',
      );
      expect(logger.fatal).toHaveBeenCalledWith(
        { missing: ['SERVER_ID', 'USERNAME'] },
        expect.any(String),
      );
      expect(exit).toHaveBeenCalledWith(1);
    });
  });

  describe('getENV', () => {
    it('returns all required values with the production database', () => {
      const { getENV } = loadEnv();

      expect(getENV()).toMatchObject({ ...REQUIRED, MONGODB_DB: 'prod' });
    });

    it('uses the test database in staging', () => {
      process.env.STAGING = 'true';
      delete process.env.MONGODB_DB;
      const { getENV } = loadEnv();

      expect(getENV().MONGODB_DB).toBe('test');
    });

    it('exits when a required value is missing', () => {
      delete process.env.DISCORD_TOKEN;
      const { getENV } = loadEnv();

      expect(() => getENV()).toThrow('exit');
      expect(logger.fatal).toHaveBeenCalledWith(
        { missing: ['DISCORD_TOKEN'] },
        expect.any(String),
      );
    });

    it('caches and freezes the result', () => {
      const { getENV } = loadEnv();
      const first = getENV();
      process.env.SERVER_ID = 'changed';

      expect(getENV()).toBe(first);
      expect(Object.isFrozen(first)).toBe(true);
    });
  });
});
