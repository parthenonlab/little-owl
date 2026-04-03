import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';

export const onResub = (
  _channel: string,
  username: string,
  streakMonths: number,
  message: string,
  _userstate: ObjectProps,
  _methods: ObjectProps,
) => {
  log({
    type: LogCode.Alert,
    description: `${username} has resubbed to the channel!\n\nStreak: ${streakMonths}\nMessage: ${message}`,
  });
};
