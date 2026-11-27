import { UserDocument } from '@parthenonlab/models';

import { TwitchIds } from '@/interfaces/bot';
import { isFeatureEnabled } from '@/lib/config';
import { getCurrency } from '@/lib/utils';

import { incTwitchUser } from '@/services/user';

import { say } from '../helpers/say';

export const onBonus = async (
  ids: TwitchIds,
  recipient: UserDocument,
  value: number,
) => {
  if (!isFeatureEnabled('BONUS')) return;

  if (recipient.twitch_id) {
    await incTwitchUser(recipient.twitch_id, 'cash', value);

    await say(
      ids,
      `${recipient.twitch_username} has received ${value} ${getCurrency(value)}`,
    );
  }

  return;
};
