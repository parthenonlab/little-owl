import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';
import { parseSubMonths } from '@/lib/utils';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';

export const onResub = async (
  _channel: string,
  username: string,
  streakMonths: number,
  message: string,
  userstate: ObjectProps,
  _methods: ObjectProps,
) => {
  const totalMonths = parseSubMonths(userstate['msg-param-cumulative-months']);

  log({
    type: LogCode.Alert,
    description: `${username} has resubbed to the channel!\n\nTotal: ${totalMonths}\nStreak: ${streakMonths}\nMessage: ${message}`,
  });

  if (!totalMonths) return;

  await findOrCreateTwitchUser(userstate['user-id'], userstate.login);
  await setTwitchUser(userstate['user-id'], { sub_months: totalMonths });
};
