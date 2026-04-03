import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

export const onRaided = (
  _channel: string,
  username: string,
  viewers: number,
) => {
  log({
    type: LogCode.Alert,
    description: `${username} has raided the chat with ${viewers} viewers!`,
  });
};
