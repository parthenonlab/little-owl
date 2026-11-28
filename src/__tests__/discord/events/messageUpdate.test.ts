jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));

import { Message, PartialMessage } from 'discord.js';

import { onMessageUpdate } from '@/discord/events/messageUpdate';
import { log } from '@/discord/helpers';

import { fake } from '../../fixtures';

const AUTHOR = {
  bot: false,
  id: '42',
  username: 'owlfan',
  displayAvatarURL: () => 'avatar.png',
};

const message = (fields: Record<string, unknown> = {}) =>
  fake<Message>({
    partial: false,
    cleanContent: 'hello',
    author: AUTHOR as unknown as Message['author'],
    channel: '#general' as unknown as Message['channel'],
    url: 'https://discord.com/channels/1/2/3',
    createdAt: new Date('2026-11-28T00:00:00Z'),
    inGuild: (() => true) as Message['inGuild'],
    ...fields,
  });

const description = () =>
  (log as jest.Mock).mock.calls[0][0].description as string;

describe('onMessageUpdate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logs the before and after text', async () => {
    await onMessageUpdate(message(), message({ cleanContent: 'hello there' }));

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'messages' }),
    );
    expect(description()).toContain('Before: hello');
    expect(description()).toContain('After: hello there');
    expect(description()).toContain('(https://discord.com/channels/1/2/3)');
  });

  it('ignores updates that do not change the text', async () => {
    await onMessageUpdate(message(), message());

    expect(log).not.toHaveBeenCalled();
  });

  it('ignores bots and messages outside a guild', async () => {
    await onMessageUpdate(
      message(),
      message({ cleanContent: 'x', author: { ...AUTHOR, bot: true } }),
    );
    await onMessageUpdate(
      message(),
      message({ cleanContent: 'x', inGuild: () => false }),
    );

    expect(log).not.toHaveBeenCalled();
  });

  it('notes when the old message was not cached', async () => {
    await onMessageUpdate(
      fake<PartialMessage>({ partial: true }),
      message({ cleanContent: 'edited' }),
    );

    expect(description()).toContain('Before: (not cached');
  });
});
