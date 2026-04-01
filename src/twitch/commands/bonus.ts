import { UserDocument } from '@parthenonlab/models';

import { twitch } from '@/lib/clients';
import { isFeatureEnabled } from '@/lib/config';
import { getCurrency } from '@/lib/utils';

import { incTwitchUser } from '@/services/user';

export const onBonus = async (
  channel: string,
  recipient: UserDocument,
  value: number,
) => {
  if (!isFeatureEnabled('BONUS')) return;

  if (recipient.twitch_id) {
    await incTwitchUser(recipient.twitch_id, { cash: value });

    twitch.say(
      channel,
      `${recipient.twitch_username} has received ${value} ${getCurrency(value)}`,
    );
  }

  return;
};
