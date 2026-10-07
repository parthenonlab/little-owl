jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/user', () => ({
  findOrCreateTwitchUser: jest.fn(),
  setTwitchUser: jest.fn(),
}));

import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';
import { onResub } from '@/twitch/events/resub';

const makeUserstate = (months?: string | boolean) => ({
  'user-id': '123',
  login: 'owlfan',
  'msg-param-cumulative-months': months,
});

describe('onResub', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates the user and sets sub_months to the cumulative months', async () => {
    await onResub('#athena', 'OwlFan', 3, 'hi', makeUserstate('14'), {});

    expect(findOrCreateTwitchUser).toHaveBeenCalledWith('123', 'owlfan');
    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 14 });
  });

  it('uses cumulative months, not the streak', async () => {
    await onResub('#athena', 'OwlFan', 0, 'hi', makeUserstate('20'), {});

    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 20 });
  });

  it('does not write when cumulative months is missing', async () => {
    await onResub('#athena', 'OwlFan', 3, 'hi', makeUserstate(), {});

    expect(findOrCreateTwitchUser).not.toHaveBeenCalled();
    expect(setTwitchUser).not.toHaveBeenCalled();
  });
});
