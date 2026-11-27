import { EventSubChannelTimeoutModerationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

export const onTimeout = (event: EventSubChannelTimeoutModerationEvent) => {
  const duration = Math.max(
    0,
    Math.round((event.expiryDate.getTime() - Date.now()) / 1000),
  );

  log({
    type: LogCode.Leave,
    description: `${event.userName} has been timed out for ${duration}s.\n\nReason: ${
      event.reason || 'None'
    }`,
  });
};
