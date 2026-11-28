import { EventSubChannelUnbanModerationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';

export const onUnban = (event: EventSubChannelUnbanModerationEvent) => {
  log({
    type: 'moderation',
    platform: 'twitch',
    description: `${event.userName} has been unbanned from ${event.broadcasterName}.`,
    footer: `Twitch Username: ${event.userName}`,
  });
};
