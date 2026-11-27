import { UserDocument } from '@parthenonlab/models';

import { CONFIG } from '@/constants';
import { TwitchIds } from '@/interfaces/bot';
import { isFeatureEnabled } from '@/lib/config';
import { getCurrency } from '@/lib/utils';
import { incTwitchUser } from '@/services/user';

import { say } from '../helpers/say';

export const onGive = async (
  ids: TwitchIds,
  user: UserDocument,
  recipient: UserDocument,
  value: number,
) => {
  if (!isFeatureEnabled('GIVE')) return;

  const replies = {
    noPoints: `${user.twitch_username} you have no ${CONFIG.CURRENCY.SINGLE} to give.`,
    notEnough: `${user.twitch_username} you don't have enough ${CONFIG.CURRENCY.PLURAL} to give.`,
    success: `${user.twitch_username} gave ${value} ${getCurrency(value)} to ${
      recipient.twitch_username
    }`,
  };

  if (user.cash < 1) return say(ids, replies.noPoints);
  if (user.cash < value) return say(ids, replies.notEnough);

  if (user.twitch_id && recipient.twitch_id) {
    await incTwitchUser(user.twitch_id, 'cash', -value);
    await incTwitchUser(recipient.twitch_id, 'cash', value);

    await say(ids, replies.success);
  }

  return;
};
