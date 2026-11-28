jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/user', () => ({ deleteTwitchUser: jest.fn() }));

import {
  EventSubChannelBanModerationEvent,
  EventSubChannelModerationEvent,
  EventSubChannelTimeoutModerationEvent,
} from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { deleteTwitchUser } from '@/services/user';
import { onModerate } from '@/twitch/events/moderate';

import { fake } from '../../fixtures';

const TARGET = { broadcasterName: 'athena', userId: '123', userName: 'troll' };

const makeBan = () =>
  fake<EventSubChannelBanModerationEvent>({
    ...TARGET,
    moderationAction: 'ban',
    reason: '',
  });

const makeTimeout = (expiryDate: Date, reason = '') =>
  fake<EventSubChannelTimeoutModerationEvent>({
    ...TARGET,
    moderationAction: 'timeout',
    expiryDate,
    reason,
  });

const descriptions = () =>
  (log as jest.Mock).mock.calls.map(([props]) => props.description);

describe('onModerate', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('ban', () => {
    it('logs the ban and deletes the user by Twitch ID', async () => {
      (deleteTwitchUser as jest.Mock).mockResolvedValue({ twitch_id: '123' });

      await onModerate(makeBan());

      expect(deleteTwitchUser).toHaveBeenCalledWith('123');
      expect(descriptions()).toEqual([
        'troll has been banned from athena!',
        'Record for troll has been removed from the users collection.',
      ]);
    });

    it('skips the deletion log when the user had no record', async () => {
      (deleteTwitchUser as jest.Mock).mockResolvedValue(null);

      await onModerate(makeBan());

      expect(descriptions()).toEqual(['troll has been banned from athena!']);
    });
  });

  describe('timeout', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    });

    afterEach(() => jest.useRealTimers());

    it('logs the duration in seconds and the reason', async () => {
      await onModerate(makeTimeout(new Date('2026-01-01T00:10:00Z'), 'spam'));

      expect(descriptions()[0]).toBe(
        'troll has been timed out for 600s.\n\nReason: spam',
      );
      expect(deleteTwitchUser).not.toHaveBeenCalled();
    });

    it('notes when no reason was given', async () => {
      await onModerate(makeTimeout(new Date('2026-01-01T00:01:00Z')));

      expect(descriptions()[0]).toContain('Reason: None');
    });
  });

  // Literal actions per case so each fake matches one member of the event union
  const IGNORED: EventSubChannelModerationEvent[] = [
    fake<EventSubChannelModerationEvent>({
      moderationAction: 'shared_chat_ban',
    }),
    fake<EventSubChannelModerationEvent>({
      moderationAction: 'shared_chat_timeout',
    }),
    fake<EventSubChannelModerationEvent>({ moderationAction: 'delete' }),
    fake<EventSubChannelModerationEvent>({ moderationAction: 'unban' }),
  ];

  it.each(IGNORED.map(event => [event.moderationAction, event] as const))(
    'ignores %s',
    async (_action, event) => {
      await onModerate(event);

      expect(log).not.toHaveBeenCalled();
      expect(deleteTwitchUser).not.toHaveBeenCalled();
    },
  );
});
