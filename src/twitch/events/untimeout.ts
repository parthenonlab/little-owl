import { EventSubChannelUntimeoutModerationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';

export const onUntimeout = (event: EventSubChannelUntimeoutModerationEvent) => {
  log({
    type: 'moderation',
    platform: 'twitch',
    description: `${event.userName}'s timeout has been removed.`,
    footer: `Twitch Username: ${event.userName}`,
  });
};
