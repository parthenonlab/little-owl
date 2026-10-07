jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/user', () => ({
  findOrCreateTwitchUser: jest.fn(),
  setTwitchUser: jest.fn(),
}));

import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';
import { onSubscription } from '@/twitch/events/subscription';

const makeUserstate = (months?: string | boolean) => ({
  'user-id': '123',
  login: 'owlfan',
  'msg-param-cumulative-months': months,
});

describe('onSubscription', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates the user and sets sub_months to the cumulative months', async () => {
    await onSubscription('#athena', 'OwlFan', {}, 'hi', makeUserstate('5'));

    expect(findOrCreateTwitchUser).toHaveBeenCalledWith('123', 'owlfan');
    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 5 });
  });

  it('handles a first-time sub (TMI.js converts "1" to true)', async () => {
    await onSubscription('#athena', 'OwlFan', {}, 'hi', makeUserstate(true));

    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 1 });
  });

  it('does not write when cumulative months is missing', async () => {
    await onSubscription('#athena', 'OwlFan', {}, 'hi', makeUserstate());

    expect(findOrCreateTwitchUser).not.toHaveBeenCalled();
    expect(setTwitchUser).not.toHaveBeenCalled();
  });
});
