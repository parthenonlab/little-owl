jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));

import {
  Activity,
  ActivityType,
  Collection,
  Guild,
  GuildBasedChannel,
  GuildMember,
  GuildMemberRoleManager,
  Presence,
  Role,
  RoleManager,
  TextChannel,
} from 'discord.js';

import { CONFIG } from '@/constants';
import { onPresenceUpdate } from '@/discord/events/presenceUpdate';
import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

import { fake, makeBotState } from '../../fixtures';

const OWNER_ID = 'owner';
const NOW = new Date('2026-11-27T12:00:00Z').getTime();
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

const flush = () => new Promise(setImmediate);

const streaming = (overrides: Partial<Activity> = {}) =>
  fake<Activity>({
    type: ActivityType.Streaming,
    details: 'Overwatch ranked',
    url: 'https://twitch.tv/athena',
    state: 'Overwatch',
    createdAt: new Date(NOW),
    assets: null,
    ...overrides,
  });

const playing = () => fake<Activity>({ type: ActivityType.Playing });

interface SetupOptions {
  memberId?: string;
  hasRole?: boolean;
  manageable?: boolean;
  status?: Presence['status'];
  activities?: Activity[];
  oldActivities?: Activity[] | null;
  alertChannel?: 'text' | 'voice' | 'missing';
  addFails?: boolean;
}

const setup = ({
  memberId = 'member',
  hasRole = false,
  manageable = true,
  status = 'online',
  activities = [],
  oldActivities = null,
  alertChannel = 'text',
  addFails = false,
}: SetupOptions = {}) => {
  const liveRole = fake<Role>({ id: CONFIG.ROLES.LIVE.ID });
  const add = addFails
    ? jest.fn().mockRejectedValue(new Error('missing permissions'))
    : jest.fn().mockResolvedValue(undefined);
  const remove = jest.fn().mockResolvedValue(undefined);
  const send = jest.fn().mockResolvedValue(undefined);

  const channel = fake<TextChannel>({
    id: CONFIG.ALERTS.LIVE.ID,
    isTextBased: (() => alertChannel === 'text') as TextChannel['isTextBased'],
    send,
  });
  const channels = alertChannel === 'missing' ? [] : [channel];

  const member = fake<GuildMember>({
    id: memberId,
    manageable,
    displayName: 'Athena',
    displayAvatarURL: () => 'https://avatar',
    user: fake<GuildMember['user']>({
      username: 'athena',
      displayAvatarURL: () => 'https://avatar',
    }),
    roles: fake<GuildMemberRoleManager>({
      cache: fake<Collection<string, Role>>({ has: () => hasRole }),
      add,
      remove,
    }),
  });

  const guild = fake<Guild>({
    available: true,
    ownerId: OWNER_ID,
    roles: fake<RoleManager>({
      cache: fake<Collection<string, Role>>({
        find: ((fn: (role: Role) => boolean) =>
          [liveRole].find(fn)) as Collection<string, Role>['find'],
      }),
    }),
    channels: fake<Guild['channels']>({
      cache: fake<Guild['channels']['cache']>({
        find: ((fn: (c: GuildBasedChannel) => boolean) =>
          channels.find(fn)) as Guild['channels']['cache']['find'],
        get: (id: string) => channels.find(c => c.id === id),
      }),
    }),
  });

  const newPresence = fake<Presence>({ guild, member, status, activities });
  const oldPresence = oldActivities
    ? fake<Presence>({ activities: oldActivities })
    : null;

  return { add, remove, send, liveRole, newPresence, oldPresence };
};

describe('onPresenceUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => jest.restoreAllMocks());

  const run = async (
    ctx: ReturnType<typeof setup>,
    state = makeBotState({ cooldowns: { stream: new Date(0) } }),
  ) => {
    await onPresenceUpdate(state, ctx.oldPresence, ctx.newPresence);
    await flush();
    return state;
  };

  describe('guards', () => {
    it('does nothing when the guild is unavailable', async () => {
      const ctx = setup({ hasRole: true, status: 'offline' });
      ctx.newPresence.guild!.available = false;

      await run(ctx);

      expect(ctx.remove).not.toHaveBeenCalled();
    });

    it('does nothing without a member', async () => {
      const ctx = setup();
      const presence = fake<Presence>({ guild: ctx.newPresence.guild });

      await expect(
        onPresenceUpdate(makeBotState(), null, presence),
      ).resolves.toBeUndefined();
    });
  });

  describe('removing the live role', () => {
    it.each<Presence['status']>(['offline', 'invisible'])(
      'removes it when the member goes %s',
      async status => {
        const ctx = setup({ hasRole: true, status, activities: [streaming()] });

        await run(ctx);

        expect(ctx.remove).toHaveBeenCalledWith(ctx.liveRole);
        expect(ctx.add).not.toHaveBeenCalled();
      },
    );

    it('removes it when the member stops streaming but has other activities', async () => {
      const ctx = setup({ hasRole: true, activities: [playing()] });

      await run(ctx);

      expect(ctx.remove).toHaveBeenCalledWith(ctx.liveRole);
    });

    it('removes it when the member has no activities', async () => {
      const ctx = setup({ hasRole: true, activities: [] });

      await run(ctx);

      expect(ctx.remove).toHaveBeenCalledWith(ctx.liveRole);
    });

    it('does nothing when the member does not have the role', async () => {
      const ctx = setup({ hasRole: false, status: 'offline' });

      await run(ctx);

      expect(ctx.remove).not.toHaveBeenCalled();
    });

    it('does nothing when the bot cannot manage the member', async () => {
      const ctx = setup({ hasRole: true, manageable: false, status: 'offline' });

      await run(ctx);

      expect(ctx.remove).not.toHaveBeenCalled();
    });

    it('can always manage the server owner', async () => {
      const ctx = setup({
        memberId: OWNER_ID,
        hasRole: true,
        manageable: false,
        status: 'offline',
      });

      await run(ctx);

      expect(ctx.remove).toHaveBeenCalledWith(ctx.liveRole);
    });
  });

  describe('adding the live role', () => {
    it('adds it and logs when the member starts streaming', async () => {
      const ctx = setup({ activities: [streaming()] });

      await run(ctx);

      expect(ctx.add).toHaveBeenCalledWith(ctx.liveRole);
      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({
          type: LogCode.Activity,
          description: 'athena aka Athena has started streaming.',
        }),
      );
    });

    it('does not add it again when the member already has it', async () => {
      const ctx = setup({ hasRole: true, activities: [streaming()] });

      await run(ctx);

      expect(ctx.add).not.toHaveBeenCalled();
      expect(ctx.remove).not.toHaveBeenCalled();
    });

    it('logs an error when adding fails', async () => {
      const ctx = setup({ activities: [streaming()], addFails: true });

      await run(ctx);

      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ type: LogCode.Error }),
      );
    });
  });

  describe('stream alert', () => {
    it('announces when the owner starts streaming and sets a 12h cooldown', async () => {
      const ctx = setup({ memberId: OWNER_ID, activities: [streaming()] });

      const state = await run(ctx);

      expect(ctx.send).toHaveBeenCalledTimes(1);
      const { content, embeds } = ctx.send.mock.calls[0][0];
      expect(content).toBe('@everyone Athena is now live!');
      expect(embeds[0].data.title).toBe('Now Streaming Overwatch');
      expect(embeds[0].data.description).toBe(
        'Overwatch ranked\n\nhttps://twitch.tv/athena',
      );
      expect(embeds[0].data.image).toBeUndefined();
      expect(state.cooldowns.stream.getTime()).toBe(NOW + TWELVE_HOURS);
    });

    it('includes the stream thumbnail when available', async () => {
      const ctx = setup({
        memberId: OWNER_ID,
        activities: [
          streaming({
            assets: fake<NonNullable<Activity['assets']>>({
              largeImageURL: () => 'https://thumb',
            }),
          }),
        ],
      });

      await run(ctx);

      expect(ctx.send.mock.calls[0][0].embeds[0].data.image).toEqual({
        url: 'https://thumb',
      });
    });

    it('does not announce for members other than the owner', async () => {
      const ctx = setup({ activities: [streaming()] });

      await run(ctx);

      expect(ctx.send).not.toHaveBeenCalled();
    });

    it('does not announce when the owner was already streaming', async () => {
      const ctx = setup({
        memberId: OWNER_ID,
        activities: [streaming()],
        oldActivities: [streaming()],
      });

      await run(ctx);

      expect(ctx.send).not.toHaveBeenCalled();
    });

    it('does not announce during the cooldown', async () => {
      const ctx = setup({ memberId: OWNER_ID, activities: [streaming()] });
      const state = makeBotState({ cooldowns: { stream: new Date(NOW + 1000) } });

      await run(ctx, state);

      expect(ctx.send).not.toHaveBeenCalled();
    });

    it.each(['missing', 'voice'] as const)(
      'does not announce when the alert channel is %s',
      async alertChannel => {
        const ctx = setup({
          memberId: OWNER_ID,
          activities: [streaming()],
          alertChannel,
        });

        const state = await run(ctx);

        expect(ctx.send).not.toHaveBeenCalled();
        expect(state.cooldowns.stream.getTime()).toBe(0);
      },
    );

    it('still adds the live role to the owner alongside the alert', async () => {
      const ctx = setup({ memberId: OWNER_ID, activities: [streaming()] });

      await run(ctx);

      expect(ctx.add).toHaveBeenCalledWith(ctx.liveRole);
    });
  });
});
