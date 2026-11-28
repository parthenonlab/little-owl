import { EventSubChannelChatSubNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';

export const onSubscription = async (
  event: EventSubChannelChatSubNotificationEvent,
) => {
  log({
    type: 'twitchNotifications',
    description: `${event.chatterName} has subscribed to the channel!\n\nMessage: ${event.messageText}`,
  });

  // EventSub doesn't include cumulative months for new subs, so only ensure at least 1
  const user = await findOrCreateTwitchUser(event.chatterId, event.chatterName);

  if (!user || user.sub_months >= 1) return;

  await setTwitchUser(event.chatterId, { sub_months: 1 });
};
