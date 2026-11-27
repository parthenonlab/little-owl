jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/user', () => ({
  findOrCreateTwitchUser: jest.fn(),
  setTwitchUser: jest.fn(),
}));

import { EventSubChannelChatResubNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';
import { onResub } from '@/twitch/events/resub';

import { fake } from '../../fixtures';

const makeEvent = (cumulativeMonths: number, streakMonths: number | null = 3) =>
  fake<EventSubChannelChatResubNotificationEvent>({
    type: 'resub',
    chatterId: '123',
    chatterName: 'owlfan',
    messageText: 'hi',
    cumulativeMonths,
    streakMonths,
  });

describe('onResub', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates the user and sets sub_months to the cumulative months', async () => {
    await onResub(makeEvent(14));

    expect(findOrCreateTwitchUser).toHaveBeenCalledWith('123', 'owlfan');
    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 14 });
  });

  it('uses cumulative months, not the streak', async () => {
    await onResub(makeEvent(20, 2));

    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 20 });
  });

  it('logs when the streak is not shared', async () => {
    await onResub(makeEvent(20, null));

    expect((log as jest.Mock).mock.calls[0][0].description).toContain(
      'Streak: not shared',
    );
  });

  it('does not write when cumulative months is missing', async () => {
    await onResub(makeEvent(0));

    expect(findOrCreateTwitchUser).not.toHaveBeenCalled();
    expect(setTwitchUser).not.toHaveBeenCalled();
  });
});
