jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/lib/clients', () => ({
  helix: { users: { getUsersByNames: jest.fn() } },
  twitchAuth: {
    addUser: jest.fn(),
    onRefresh: jest.fn(),
    onRefreshFailure: jest.fn(),
  },
}));
jest.mock('@/services/token', () => ({
  getTwitchToken: jest.fn(),
  saveTwitchToken: jest.fn(),
}));

import { log } from '@/discord/helpers';
import { helix, twitchAuth } from '@/lib/clients';
import { getTwitchToken, saveTwitchToken } from '@/services/token';
import { initTwitchAuth } from '@/twitch/helpers/initTwitchAuth';

const getUsersByNames = helix.users.getUsersByNames as jest.Mock;
const getToken = getTwitchToken as jest.Mock;

const TOKEN = {
  accessToken: 'access',
  refreshToken: 'refresh',
  scope: ['user:read:chat'],
  expiresIn: 3600,
  obtainmentTimestamp: 1000,
};

describe('initTwitchAuth', () => {
  const env = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...env, USERNAME: 'LittleOwl', CHANNELS: '#athena,other' };
    delete process.env.STAGING;
    getUsersByNames.mockResolvedValue([
      { id: '143', name: 'littleowl' },
      { id: '999', name: 'athena' },
    ]);
    getToken.mockResolvedValue(TOKEN);
  });

  afterAll(() => {
    process.env = env;
  });

  it('adds the stored token for the bot and returns both IDs', async () => {
    await expect(initTwitchAuth()).resolves.toEqual({
      botId: '143',
      broadcasterId: '999',
    });

    expect(getUsersByNames).toHaveBeenCalledWith(['littleowl', 'athena']);
    expect(getToken).toHaveBeenCalledWith('143');
    expect(twitchAuth.addUser).toHaveBeenCalledWith('143', TOKEN);
  });

  it('saves refreshed tokens', async () => {
    await initTwitchAuth();

    const onRefresh = (twitchAuth.onRefresh as jest.Mock).mock.calls[0][0];
    onRefresh('143', TOKEN);

    expect(saveTwitchToken).toHaveBeenCalledWith('143', TOKEN);
  });

  it('logs refresh failures', async () => {
    await initTwitchAuth();

    const onFailure = (twitchAuth.onRefreshFailure as jest.Mock).mock.calls[0][0];
    onFailure('143', new Error('invalid refresh token'));

    expect(log).toHaveBeenCalled();
  });

  it('throws when USERNAME or CHANNELS is missing', async () => {
    delete process.env.CHANNELS;

    await expect(initTwitchAuth()).rejects.toThrow('Missing USERNAME or CHANNELS');
  });

  it('throws when the bot user does not exist', async () => {
    getUsersByNames.mockResolvedValue([{ id: '999', name: 'athena' }]);

    await expect(initTwitchAuth()).rejects.toThrow('"littleowl" not found');
    expect(twitchAuth.addUser).not.toHaveBeenCalled();
  });

  it('throws when the broadcaster does not exist', async () => {
    getUsersByNames.mockResolvedValue([{ id: '143', name: 'littleowl' }]);

    await expect(initTwitchAuth()).rejects.toThrow('"athena" not found');
    expect(twitchAuth.addUser).not.toHaveBeenCalled();
  });

  it('throws with the auth command when no token is stored', async () => {
    getToken.mockResolvedValue(null);

    await expect(initTwitchAuth()).rejects.toThrow('yarn twitch:auth.');
    expect(twitchAuth.addUser).not.toHaveBeenCalled();
  });

  it('suggests the staging auth command in staging', async () => {
    process.env.STAGING = 'true';
    getToken.mockResolvedValue(null);

    await expect(initTwitchAuth()).rejects.toThrow('yarn twitch:auth:staging.');
  });
});
