import { EventSubChannelChatCommunitySubGiftNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';

export const onSubMysteryGift = (
  event: EventSubChannelChatCommunitySubGiftNotificationEvent,
) => {
  const gifter = event.chatterIsAnonymous
    ? 'An anonymous gifter'
    : event.chatterName;

  log({
    type: 'twitchNotifications',
    description: `${gifter} is gifting ${event.amount} subscription${
      event.amount > 1 ? 's' : ''
    } in the channel!`,
  });
};
