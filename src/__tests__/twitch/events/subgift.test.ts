jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/user', () => ({
  findOrCreateTwitchUser: jest.fn(),
  setTwitchUser: jest.fn(),
}));

import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';
import { onSubGift } from '@/twitch/events/subgift';

const makeUserstate = (months?: string | boolean) => ({
  'user-id': '999',
  login: 'gifter',
  'msg-param-recipient-id': '123',
  'msg-param-recipient-user-name': 'owlfan',
  'msg-param-months': months,
});

describe('onSubGift', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates the recipient and sets their sub_months', async () => {
    await onSubGift('#athena', 'Gifter', 0, 'OwlFan', {}, makeUserstate('8'));

    expect(findOrCreateTwitchUser).toHaveBeenCalledWith('123', 'owlfan');
    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 8 });
  });

  it('never writes to the gifter', async () => {
    await onSubGift('#athena', 'Gifter', 0, 'OwlFan', {}, makeUserstate('8'));

    expect(findOrCreateTwitchUser).not.toHaveBeenCalledWith(
      '999',
      expect.anything(),
    );
    expect(setTwitchUser).not.toHaveBeenCalledWith('999', expect.anything());
  });

  it('does not write when months is missing', async () => {
    await onSubGift('#athena', 'Gifter', 0, 'OwlFan', {}, makeUserstate());

    expect(findOrCreateTwitchUser).not.toHaveBeenCalled();
    expect(setTwitchUser).not.toHaveBeenCalled();
  });
});
