import { EventSubChannelChatCommunitySubGiftNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

export const onSubMysteryGift = (
  event: EventSubChannelChatCommunitySubGiftNotificationEvent,
) => {
  const gifter = event.chatterIsAnonymous
    ? 'An anonymous gifter'
    : event.chatterName;

  log({
    type: LogCode.Alert,
    description: `${gifter} is gifting ${event.amount} subscription${
      event.amount > 1 ? 's' : ''
    } in the channel!`,
  });
};
