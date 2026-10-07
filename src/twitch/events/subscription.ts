import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';
import { parseSubMonths } from '@/lib/utils';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';

export const onSubscription = async (
  _channel: string,
  username: string,
  _methods: ObjectProps,
  message: string,
  userstate: ObjectProps,
) => {
  log({
    type: LogCode.Alert,
    description: `${username} has subscribed to the channel!\n\nMessage: ${message}`,
  });

  const totalMonths = parseSubMonths(userstate['msg-param-cumulative-months']);

  if (!totalMonths) return;

  await findOrCreateTwitchUser(userstate['user-id'], userstate.login);
  await setTwitchUser(userstate['user-id'], { sub_months: totalMonths });
};
