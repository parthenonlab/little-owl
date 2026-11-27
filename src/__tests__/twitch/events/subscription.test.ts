jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/user', () => ({
  findOrCreateTwitchUser: jest.fn(),
  setTwitchUser: jest.fn(),
}));

import { EventSubChannelChatSubNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';
import { onSubscription } from '@/twitch/events/subscription';

import { fake } from '../../fixtures';

const EVENT = fake<EventSubChannelChatSubNotificationEvent>({
  type: 'sub',
  chatterId: '123',
  chatterName: 'owlfan',
  messageText: 'hi',
});

describe('onSubscription', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logs the sub', async () => {
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue({ sub_months: 0 });

    await onSubscription(EVENT);

    expect((log as jest.Mock).mock.calls[0][0].description).toContain(
      'owlfan has subscribed',
    );
  });

  it('creates the user and sets sub_months to 1 when they had none', async () => {
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue({ sub_months: 0 });

    await onSubscription(EVENT);

    expect(findOrCreateTwitchUser).toHaveBeenCalledWith('123', 'owlfan');
    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 1 });
  });

  it('keeps existing sub_months for returning subscribers', async () => {
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue({ sub_months: 10 });

    await onSubscription(EVENT);

    expect(setTwitchUser).not.toHaveBeenCalled();
  });

  it('does not write when the user could not be created', async () => {
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue(null);

    await onSubscription(EVENT);

    expect(setTwitchUser).not.toHaveBeenCalled();
  });
});
