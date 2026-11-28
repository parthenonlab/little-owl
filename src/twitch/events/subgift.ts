import { EventSubChannelChatSubGiftNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';

export const onSubGift = async (
  event: EventSubChannelChatSubGiftNotificationEvent,
) => {
  const { recipientId, recipientName } = event;
  const gifter = event.chatterIsAnonymous
    ? 'An anonymous gifter'
    : event.chatterName;

  log({
    type: 'twitchNotifications',
    description: `${gifter} gifted a subscription to ${recipientName}!`,
  });

  // EventSub doesn't include the recipient's cumulative months, so only ensure at least 1
  const recipient = await findOrCreateTwitchUser(recipientId, recipientName);

  if (!recipient || recipient.sub_months >= 1) return;

  await setTwitchUser(recipientId, { sub_months: 1 });
};
