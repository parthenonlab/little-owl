import { EventSubChannelChatNotificationEvent } from '@twurple/eventsub-base';

import { onRaided } from './raided';
import { onResub } from './resub';
import { onSubGift } from './subgift';
import { onSubMysteryGift } from './submysterygift';
import { onSubscription } from './subscription';

/**
 * Route a `channel.chat.notification` event to its handler.
 * `shared_chat_*` types (events from other channels in a Shared Chat session) and
 * unhandled types (announcements, upgrades, etc.) are ignored.
 *
 * @param event - The chat notification event.
 */
export const onChatNotification = async (
  event: EventSubChannelChatNotificationEvent,
) => {
  switch (event.type) {
    case 'sub':
      return onSubscription(event);
    case 'resub':
      return onResub(event);
    case 'sub_gift':
      return onSubGift(event);
    case 'community_sub_gift':
      return onSubMysteryGift(event);
    case 'raid':
      return onRaided(event);
  }
};
