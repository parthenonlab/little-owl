import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';

export const onSubscription = (
  _channel: string,
  username: string,
  _methods: ObjectProps,
  message: string,
  _userstate: ObjectProps,
) => {
  log({
    type: LogCode.Alert,
    description: `${username} has subscribed to the channel!\n\nMessage: ${message}`,
  });
};
