import { EventSubChannelTimeoutModerationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';

export const onTimeout = (event: EventSubChannelTimeoutModerationEvent) => {
  const duration = Math.max(
    0,
    Math.round((event.expiryDate.getTime() - Date.now()) / 1000),
  );

  log({
    type: 'moderation',
    platform: 'twitch',
    description: `${event.userName} has been timed out for ${duration}s.\n\nReason: ${
      event.reason || 'None'
    }`,
  });
};
