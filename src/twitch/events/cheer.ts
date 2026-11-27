import { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

export const onCheer = (event: EventSubChannelChatMessageEvent) => {
  log({
    type: LogCode.Alert,
    description: `${event.chatterName} cheered ${event.bits} in the chat!\n\nMessage: ${event.messageText}`,
  });
};
