import { EventSubChannelBanModerationEvent } from '@twurple/eventsub-base';

import { log } from '@/discord/helpers';
import { deleteTwitchUser } from '@/services/user';

export const onBan = async (event: EventSubChannelBanModerationEvent) => {
  const { broadcasterName, userId, userName } = event;

  log({
    type: 'moderation',
    platform: 'twitch',
    description: `${userName} has been banned from ${broadcasterName}!`,
  });

  const deleted = await deleteTwitchUser(userId);

  if (!deleted) return;

  log({
    type: 'accounts',
    description: `Record for ${userName} has been removed from the users collection.`,
    footer: `Twitch Username: ${userName}`,
  });
};
