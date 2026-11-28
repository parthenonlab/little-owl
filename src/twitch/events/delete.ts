import { EventSubChannelDeleteModerationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';

export const onDelete = (event: EventSubChannelDeleteModerationEvent) => {
  log({
    type: 'moderation',
    platform: 'twitch',
    description: `${event.moderatorName} deleted a message from ${event.userName}.\n\nMessage: ${event.messageText}`,
    footer: `Twitch Username: ${event.userName}`,
  });
};
