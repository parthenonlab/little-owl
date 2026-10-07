import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';
import { parseSubMonths } from '@/lib/utils';
import { findOrCreateTwitchUser, setTwitchUser } from '@/services/user';

export const onSubGift = async (
  _channel: string,
  username: string,
  _streakMonths: number,
  recipient: string,
  _methods: ObjectProps,
  userstate: ObjectProps,
) => {
  log({
    type: LogCode.Alert,
    description: `${username} gifted a subscription to ${recipient}!`,
  });

  // msg-param-months is the recipient's total months, not the gifter's
  const totalMonths = parseSubMonths(userstate['msg-param-months']);

  if (!totalMonths) return;

  const recipientId = userstate['msg-param-recipient-id'];

  await findOrCreateTwitchUser(
    recipientId,
    userstate['msg-param-recipient-user-name'],
  );
  await setTwitchUser(recipientId, { sub_months: totalMonths });
};
