import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';

export const onTimeout = (
  _channel: string,
  username: string,
  reason: string,
  duration: number,
  _userstate: ObjectProps,
) => {
  log({
    type: LogCode.Leave,
    description: `${username} has been timed out for ${duration}s.\n\nReason: ${reason}`,
  });
};
