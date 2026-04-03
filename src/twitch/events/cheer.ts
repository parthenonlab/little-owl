import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';

export const onCheer = (
  _channel: string,
  userstate: ObjectProps,
  message: string,
) => {
  log({
    type: LogCode.Alert,
    description: `${userstate.username} cheered ${userstate.bits} in the chat!\n\nMessage: ${message}`,
  });
};
