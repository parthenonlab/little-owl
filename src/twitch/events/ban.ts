import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { deleteTwitchUserByName } from '@/services/user';

export const onBan = async (
  channel: string,
  username: string,
  _reason: string,
) => {
  log({
    type: LogCode.Leave,
    description: `${username} has been banned from ${channel}!`,
  });

  await deleteTwitchUserByName(username);

  log({
    type: LogCode.Deleted,
    description: `Record for ${username} has been removed from the users collection.`,
    footer: `Twitch Username: ${username}`,
  });
};
