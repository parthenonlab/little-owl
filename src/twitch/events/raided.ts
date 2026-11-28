import { EventSubChannelChatRaidNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';

export const onRaided = (event: EventSubChannelChatRaidNotificationEvent) => {
  log({
    type: 'twitchNotifications',
    description: `${event.raiderName} has raided the chat with ${event.viewerCount} viewers!`,
  });
};
