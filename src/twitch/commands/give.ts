import { UserDocument } from '@parthenonlab/models';

import { CONFIG } from '@/constants';

import { twitch } from '@/lib/clients';
import { isFeatureEnabled } from '@/lib/config';
import { getCurrency } from '@/lib/utils';

import { incTwitchUser, setTwitchUser } from '@/services/user';

export const onGive = async (
  channel: string,
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

  if (user.cash < 1) return twitch.say(channel, replies.noPoints);
  if (user.cash < value) return twitch.say(channel, replies.notEnough);

  if (user.twitch_id && recipient.twitch_id) {
    await setTwitchUser(user.twitch_id, { cash: user.cash - value });
    await incTwitchUser(recipient.twitch_id, { cash: value });

    twitch.say(channel, replies.success);
  }

  return;
};
