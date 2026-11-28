jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/lib/logger', () => ({ logger: { error: jest.fn() } }));
jest.mock('@/services/user', () => ({ setDiscordUser: jest.fn() }));

import { Collection, GuildMember, PartialGuildMember } from 'discord.js';

import { CONFIG } from '@/constants';
import { onGuildMemberUpdate } from '@/discord/events/guildMemberUpdate';
import { log } from '@/discord/helpers';
import { setDiscordUser } from '@/services/user';

import { fake } from '../../fixtures';

const member = ({
  nickname = null,
  roleIds = [],
  partial = false,
}: { nickname?: string | null; roleIds?: string[]; partial?: boolean } = {}) =>
  fake<GuildMember>({
    id: '42',
    partial: partial as false,
    nickname,
    user: { username: 'owlfan' } as GuildMember['user'],
    displayAvatarURL: () => 'avatar.png',
    roles: {
      cache: new Collection(roleIds.map(id => [id, { id }])),
    } as unknown as GuildMember['roles'],
  });

const descriptions = () =>
  (log as jest.Mock).mock.calls.map(([props]) => props.description);

const SUB_ROLE = CONFIG.ROLES.SUBSCRIBER.DISCORD;

describe('onGuildMemberUpdate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logs nickname changes', async () => {
    await onGuildMemberUpdate(
      member({ nickname: 'Owl' }),
      member({ nickname: 'Hoot' }),
    );

    expect(descriptions()).toEqual([
      'owlfan changed their nickname from Owl to Hoot.',
    ]);
    expect(setDiscordUser).not.toHaveBeenCalled();
  });

  it('shows (none) when a nickname is added or cleared', async () => {
    await onGuildMemberUpdate(member(), member({ nickname: 'Hoot' }));

    expect(descriptions()).toEqual([
      'owlfan changed their nickname from (none) to Hoot.',
    ]);
  });

  it('logs and saves a gained subscriber role', async () => {
    await onGuildMemberUpdate(member(), member({ roleIds: [SUB_ROLE] }));

    expect(descriptions()).toEqual(['owlfan has gained the subscriber role.']);
    expect(setDiscordUser).toHaveBeenCalledWith('42', { subscriber: true });
  });

  it('logs and saves a lost subscriber role', async () => {
    await onGuildMemberUpdate(member({ roleIds: [SUB_ROLE] }), member());

    expect(descriptions()).toEqual(['owlfan has lost the subscriber role.']);
    expect(setDiscordUser).toHaveBeenCalledWith('42', { subscriber: false });
  });

  it('does not log when the old member was not cached, but still saves', async () => {
    await onGuildMemberUpdate(
      member({ partial: true }) as unknown as PartialGuildMember,
      member({ nickname: 'Hoot', roleIds: [SUB_ROLE] }),
    );

    expect(log).not.toHaveBeenCalled();
    expect(setDiscordUser).toHaveBeenCalledWith('42', { subscriber: true });
  });

  it('does nothing when neither changed', async () => {
    await onGuildMemberUpdate(
      member({ nickname: 'Owl' }),
      member({ nickname: 'Owl' }),
    );

    expect(log).not.toHaveBeenCalled();
    expect(setDiscordUser).not.toHaveBeenCalled();
  });
});
