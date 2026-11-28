import { EventSubChannelChatResubNotificationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';

export const onResub = async (
  event: EventSubChannelChatResubNotificationEvent,
) => {
  const { chatterId, chatterName, cumulativeMonths, streakMonths } = event;

  log({
    type: 'twitchNotifications',
    description: `${chatterName} has resubbed to the channel!\n\nTotal: ${cumulativeMonths}\nStreak: ${
      streakMonths ?? 'not shared'
    }\nMessage: ${event.messageText}`,
  });

  if (!cumulativeMonths) return;

  await findOrCreateTwitchUser(chatterId, chatterName);
  await setTwitchUser(chatterId, { sub_months: cumulativeMonths });
};
