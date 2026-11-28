import { EventSubChannelModerationEvent } from '@twurple/eventsub-base';

import { onBan } from './ban';
import { onDelete } from './delete';
import { onTimeout } from './timeout';
import { onUnban } from './unban';
import { onUntimeout } from './untimeout';

/**
 * Route a `channel.moderate` event to its handler.
 * `shared_chat_*` actions (from other channels in a Shared Chat session) and other actions are ignored.
 *
 * @param event - The moderation event.
 */
export const onModerate = async (event: EventSubChannelModerationEvent) => {
  switch (event.moderationAction) {
    case 'ban':
      return onBan(event);
    case 'delete':
      return onDelete(event);
    case 'timeout':
      return onTimeout(event);
    case 'unban':
      return onUnban(event);
    case 'untimeout':
      return onUntimeout(event);
  }
};
