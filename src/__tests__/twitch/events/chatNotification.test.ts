jest.mock('@/twitch/events/raided', () => ({ onRaided: jest.fn() }));
jest.mock('@/twitch/events/resub', () => ({ onResub: jest.fn() }));
jest.mock('@/twitch/events/subgift', () => ({ onSubGift: jest.fn() }));
jest.mock('@/twitch/events/submysterygift', () => ({
  onSubMysteryGift: jest.fn(),
}));
jest.mock('@/twitch/events/subscription', () => ({
  onSubscription: jest.fn(),
}));

import { EventSubChannelChatNotificationEvent } from '@twurple/eventsub-base';

import { onChatNotification } from '@/twitch/events/chatNotification';
import { onRaided } from '@/twitch/events/raided';
import { onResub } from '@/twitch/events/resub';
import { onSubGift } from '@/twitch/events/subgift';
import { onSubMysteryGift } from '@/twitch/events/submysterygift';
import { onSubscription } from '@/twitch/events/subscription';

import { fake } from '../../fixtures';

// Literal types per case so each fake matches one member of the event union
const event = (fields: Partial<EventSubChannelChatNotificationEvent>) =>
  fake<EventSubChannelChatNotificationEvent>(fields);

const HANDLERS = [
  onRaided,
  onResub,
  onSubGift,
  onSubMysteryGift,
  onSubscription,
];

describe('onChatNotification', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['sub', event({ type: 'sub' }), onSubscription],
    ['resub', event({ type: 'resub' }), onResub],
    ['sub_gift', event({ type: 'sub_gift' }), onSubGift],
    [
      'community_sub_gift',
      event({ type: 'community_sub_gift' }),
      onSubMysteryGift,
    ],
    ['raid', event({ type: 'raid' }), onRaided],
  ] as const)(
    'routes %s to its handler',
    async (_type, notification, handler) => {
      await onChatNotification(notification);

      expect(handler).toHaveBeenCalledWith(notification);
      HANDLERS.filter(h => h !== handler).forEach(h =>
        expect(h).not.toHaveBeenCalled(),
      );
    },
  );

  it.each([
    ['shared_chat_sub', event({ type: 'shared_chat_sub' })],
    ['shared_chat_raid', event({ type: 'shared_chat_raid' })],
    ['announcement', event({ type: 'announcement' })],
    ['gift_paid_upgrade', event({ type: 'gift_paid_upgrade' })],
  ] as const)('ignores %s', async (_type, notification) => {
    await onChatNotification(notification);

    HANDLERS.forEach(h => expect(h).not.toHaveBeenCalled());
  });
});
