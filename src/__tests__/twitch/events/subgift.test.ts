jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/user', () => ({
  findOrCreateTwitchUser: jest.fn(),
  setTwitchUser: jest.fn(),
}));

import { EventSubChannelChatSubGiftNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';
import { onSubGift } from '@/twitch/events/subgift';

import { fake } from '../../fixtures';

const makeEvent = (chatterIsAnonymous = false) =>
  fake<EventSubChannelChatSubGiftNotificationEvent>({
    type: 'sub_gift',
    chatterId: '999',
    chatterName: 'santa',
    chatterIsAnonymous,
    recipientId: '123',
    recipientName: 'owlfan',
  });

describe('onSubGift', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates the recipient and sets sub_months to 1 when they had none', async () => {
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue({ sub_months: 0 });

    await onSubGift(makeEvent());

    expect(findOrCreateTwitchUser).toHaveBeenCalledWith('123', 'owlfan');
    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 1 });
  });

  it("keeps the recipient's existing sub_months", async () => {
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue({ sub_months: 8 });

    await onSubGift(makeEvent());

    expect(setTwitchUser).not.toHaveBeenCalled();
  });

  it('never writes to the gifter', async () => {
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue({ sub_months: 0 });

    await onSubGift(makeEvent());

    expect(findOrCreateTwitchUser).not.toHaveBeenCalledWith(
      '999',
      expect.anything(),
    );
    expect(setTwitchUser).not.toHaveBeenCalledWith('999', expect.anything());
  });

  it('logs anonymous gifts without the gifter name', async () => {
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue({ sub_months: 0 });

    await onSubGift(makeEvent(true));

    const description = (log as jest.Mock).mock.calls[0][0].description;
    expect(description).toContain('An anonymous gifter gifted');
    expect(description).not.toContain('santa');
  });
});
