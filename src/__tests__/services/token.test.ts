jest.mock('@/discord/helpers/log', () => ({ log: jest.fn() }));
jest.mock('@/models/token', () => ({
  TokenModel: { findOne: jest.fn(), updateOne: jest.fn() },
}));

import { log } from '@/discord/helpers/log';
import { TokenModel } from '@/models/token';
import { getTwitchToken, saveTwitchToken } from '@/services/token';

const findOne = TokenModel.findOne as jest.Mock;
const updateOne = TokenModel.updateOne as jest.Mock;

const DOC = {
  user_id: '123',
  access_token: 'access',
  refresh_token: 'refresh',
  scope: ['user:read:chat'],
  expires_in: 3600,
  obtainment_timestamp: 1000,
};

const TOKEN = {
  accessToken: 'access',
  refreshToken: 'refresh',
  scope: ['user:read:chat'],
  expiresIn: 3600,
  obtainmentTimestamp: 1000,
};

describe('token service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getTwitchToken', () => {
    it('maps the stored document to a Twurple token', async () => {
      findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(DOC) });

      await expect(getTwitchToken('123')).resolves.toEqual(TOKEN);
      expect(findOne).toHaveBeenCalledWith({ user_id: '123' });
    });

    it('returns null when no token is stored', async () => {
      findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await expect(getTwitchToken('123')).resolves.toBeNull();
    });

    it('logs and returns null on error', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('boom')),
      });

      await expect(getTwitchToken('123')).resolves.toBeNull();
      expect(log).toHaveBeenCalled();
    });
  });

  describe('saveTwitchToken', () => {
    it('upserts the token using snake_case fields', async () => {
      await saveTwitchToken('123', TOKEN);

      const { user_id, ...fields } = DOC;
      expect(updateOne).toHaveBeenCalledWith(
        { user_id },
        { $set: fields },
        { upsert: true },
      );
    });

    it('logs on error', async () => {
      updateOne.mockRejectedValue(new Error('boom'));

      await saveTwitchToken('123', TOKEN);

      expect(log).toHaveBeenCalled();
    });
  });
});
