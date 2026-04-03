import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';

export const onSubGift = (
  _channel: string,
  username: string,
  _streakMonths: number,
  recipient: string,
  _methods: ObjectProps,
  _userstate: ObjectProps,
) => {
  log({
    type: LogCode.Alert,
    description: `${username} gifted a subscription to ${recipient}!`,
  });
};
