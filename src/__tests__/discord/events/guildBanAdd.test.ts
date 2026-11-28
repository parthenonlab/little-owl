jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/activity', () => ({ deleteActivity: jest.fn() }));
jest.mock('@/services/stats', () => ({ deleteStats: jest.fn() }));
jest.mock('@/services/user', () => ({ deleteDiscordUser: jest.fn() }));

import { GuildBan } from 'discord.js';

import { onGuildBanAdd } from '@/discord/events/guildBanAdd';
import { log } from '@/discord/helpers';
import { deleteActivity } from '@/services/activity';
import { deleteStats } from '@/services/stats';
import { deleteDiscordUser } from '@/services/user';

import { fake } from '../../fixtures';

const ban = (reason: string | null = null) =>
  fake<GuildBan>({
    reason,
    user: {
      id: '42',
      username: 'troll',
      displayName: 'Troll',
      displayAvatarURL: () => 'avatar.png',
    } as unknown as GuildBan['user'],
  });

const calls = () => (log as jest.Mock).mock.calls.map(([props]) => props);

const removed = (activity: boolean, stats: boolean, user: boolean) => {
  (deleteActivity as jest.Mock).mockResolvedValue(activity ? {} : null);
  (deleteStats as jest.Mock).mockResolvedValue(stats ? {} : null);
  (deleteDiscordUser as jest.Mock).mockResolvedValue(user ? {} : null);
};

describe('onGuildBanAdd', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logs the ban as Discord moderation with the reason', async () => {
    removed(false, false, false);

    await onGuildBanAdd(ban('spam'));

    expect(calls()[0]).toMatchObject({
      type: 'moderation',
      platform: 'discord',
      description: 'troll has been banned from the server.\nReason: spam',
    });
  });

  it('deletes all records for the user', async () => {
    removed(true, true, true);

    await onGuildBanAdd(ban());

    expect(deleteActivity).toHaveBeenCalledWith('42');
    expect(deleteStats).toHaveBeenCalledWith('42');
    expect(deleteDiscordUser).toHaveBeenCalledWith('42');
  });

  it('logs one accounts embed listing only the removed records', async () => {
    removed(true, false, true);

    await onGuildBanAdd(ban());

    expect(calls()).toHaveLength(2);
    expect(calls()[1]).toMatchObject({
      type: 'accounts',
      description:
        'Records for troll have been removed from: activities, users.',
    });
  });

  it('skips the accounts embed when the user had no records', async () => {
    removed(false, false, false);

    await onGuildBanAdd(ban());

    expect(calls()).toHaveLength(1);
    expect(calls()[0].type).toBe('moderation');
  });
});
