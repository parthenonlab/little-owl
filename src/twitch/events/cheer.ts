import { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';

export const onCheer = (event: EventSubChannelChatMessageEvent) => {
  log({
    type: 'twitchNotifications',
    description: `${event.chatterName} cheered ${event.bits} in the chat!\n\nMessage: ${event.messageText}`,
  });
};
