jest.mock('@/lib/clients', () => ({
  discord: { guilds: { cache: { get: jest.fn() } } },
}));
jest.mock('@/lib/config', () => ({
  getENV: () => ({ ADMIN_SERVER_ID: 'admin' }),
}));
jest.mock('@/lib/logger', () => ({ logger: { warn: jest.fn() } }));

import { EmbedBuilder } from 'discord.js';

import { CONFIG } from '@/constants';
import { log, logToErrorsChannel } from '@/discord/helpers/log';
import { discord } from '@/lib/clients';
import { logger } from '@/lib/logger';

const getGuild = discord.guilds.cache.get as jest.Mock;

/** A text channel per ID that records what was sent to it. */
const setup = ({ available = true, sendFails = false } = {}) => {
  const send = sendFails
    ? jest.fn().mockRejectedValue(new Error('Missing Access'))
    : jest.fn().mockResolvedValue(undefined);

  const getChannel = jest.fn((_id: string) => ({
    isTextBased: () => true,
    send,
  }));

  getGuild.mockReturnValue({
    available,
    name: 'Admin',
    channels: { cache: { get: getChannel } },
  });

  const sentTo = () => getChannel.mock.calls.map(([id]) => id);
  const embed = () =>
    (send.mock.calls[0][0].embeds[0] as EmbedBuilder).toJSON();

  return { send, sentTo, embed };
};

describe('log', () => {
  const { STAGING } = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.STAGING;
  });

  afterAll(() => {
    process.env.STAGING = STAGING;
  });

  it('sends each type to its channel', async () => {
    const { sentTo } = setup();

    await log({ type: 'members', description: 'a' });
    await log({ type: 'messages', description: 'b' });
    await log({ type: 'accounts', description: 'c' });
    await log({ type: 'twitchNotifications', description: 'd' });
    await log({ type: 'moderation', platform: 'discord', description: 'e' });

    const { LOGS } = CONFIG.CHANNELS;
    expect(sentTo()).toEqual([
      LOGS.MEMBERS,
      LOGS.MESSAGES,
      LOGS.ACCOUNTS,
      LOGS.TWITCH_NOTIFICATIONS,
      LOGS.MODERATION,
    ]);
  });

  it('builds the embed from the props', async () => {
    const { embed } = setup();

    await log({
      type: 'members',
      title: 'Title',
      description: 'Body',
      thumbnail: 'https://example.com/thumb.png',
      footer: 'Footer',
    });

    expect(embed()).toMatchObject({
      title: 'Title',
      description: 'Body',
      thumbnail: { url: 'https://example.com/thumb.png' },
      footer: { text: 'Footer' },
    });
    expect(embed().author).toBeUndefined();
  });

  it('shows the platform in the author line for moderation', async () => {
    const { embed } = setup();

    await log({ type: 'moderation', platform: 'twitch', description: 'x' });

    expect(embed().author?.name).toBe('Twitch');
  });

  it('uses the server name as the author when only an icon is given', async () => {
    const { embed } = setup();

    await log({
      type: 'messages',
      description: 'x',
      authorIcon: 'https://example.com/icon.png',
    });

    expect(embed().author).toEqual({
      name: 'Admin Server',
      icon_url: 'https://example.com/icon.png',
    });
  });

  it('uses the production channels in staging', async () => {
    process.env.STAGING = 'true';
    const { sentTo } = setup();

    await log({ type: 'members', description: 'a' });
    await logToErrorsChannel({ description: 'b' });

    expect(sentTo()).toEqual([
      CONFIG.CHANNELS.LOGS.MEMBERS,
      CONFIG.CHANNELS.LOGS.ERRORS,
    ]);
  });

  it('sends errors to the errors channel', async () => {
    const { sentTo } = setup();

    await logToErrorsChannel({ title: 'Failed', description: 'stack' });

    expect(sentTo()).toEqual([CONFIG.CHANNELS.LOGS.ERRORS]);
  });

  it('falls back to the logger when the admin server is unavailable', async () => {
    const { send } = setup({ available: false });

    await log({ type: 'members', description: 'a' });

    expect(send).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: 'members',
        reason: 'admin server unavailable',
      }),
      'Discord log undelivered',
    );
  });

  it('falls back to the logger instead of rejecting when sending fails', async () => {
    setup({ sendFails: true });

    await expect(
      log({ type: 'members', description: 'a' }),
    ).resolves.toBeUndefined();

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'send failed: Missing Access' }),
      'Discord log undelivered',
    );
  });
});
