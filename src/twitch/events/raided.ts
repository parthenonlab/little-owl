import { EventSubChannelChatRaidNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

export const onRaided = (event: EventSubChannelChatRaidNotificationEvent) => {
  log({
    type: LogCode.Alert,
    description: `${event.raiderName} has raided the chat with ${event.viewerCount} viewers!`,
  });
};
