import { CONFIG, EMOTES } from '@/constants';
import { UserDocument } from '@/interfaces/user';

import { twitch } from '@/lib/clients';
import { getCurrency, isNumber, weightedRandom } from '@/lib/utils';

import { setTwitchUser } from '@/services/user';

export const onGamble = async (
  channel: string,
  user: UserDocument,
  args: string[],
) => {
  if (!CONFIG.FEATURES.GAMBLE.ENABLED) return;

  const replies = {
    lostAll: `${user.twitch_username} lost all of their ${CONFIG.CURRENCY.PLURAL}. ${EMOTES.GAMBLE.LOST}`,
    noPoints: `${user.twitch_username} you have no ${CONFIG.CURRENCY.SINGLE} to gamble. ${EMOTES.GAMBLE.LOST}`,
    notEnough: `${user.twitch_username} you don't have enough ${CONFIG.CURRENCY.PLURAL} to gamble. ${EMOTES.GAMBLE.INVALID}`,
  };

  if (user.cash < 1) {
    twitch.say(channel, replies.noPoints);
    return;
  }

  const value = args[0];

  if (!isNumber(value) && value !== 'all' && value !== 'half') return;

  const amount = parseInt(value, 10);

  if (amount < 1) return;

  const probability = {
    win: CONFIG.FEATURES.GAMBLE.WIN_PERCENT / 100,
    loss: 1 - CONFIG.FEATURES.GAMBLE.WIN_PERCENT / 100,
  };

  let points = user.cash;
  const result = weightedRandom(probability);

  if (value === 'all') {
    if (result === 'win') {
      points += user.cash;
      twitch.say(
        channel,
        `${user.twitch_username} won ${user.cash} ${getCurrency(user.cash)}! ${
          EMOTES.GAMBLE.WIN
        } Current balance: ${points} ${getCurrency(points)}`,
      );
    } else {
      points = 0;
      twitch.say(channel, replies.lostAll);
    }
  } else if (value === 'half') {
    const halfPoints = Math.round(user.cash / 2);

    if (result === 'win') {
      points += halfPoints;
      twitch.say(
        channel,
        `${user.twitch_username} won ${halfPoints} ${getCurrency(
          halfPoints,
        )}! ${EMOTES.GAMBLE.WIN} Current balance: ${points} ${getCurrency(
          points,
        )}`,
      );
    } else {
      points -= halfPoints;
      twitch.say(
        channel,
        `${user.twitch_username} lost ${halfPoints} ${getCurrency(
          halfPoints,
        )}. ${EMOTES.GAMBLE.LOST} Current balance: ${points} ${getCurrency(
          points,
        )}`,
      );
    }
  } else if (amount <= user.cash) {
    if (result === 'win') {
      points += amount;
      twitch.say(
        channel,
        `${user.twitch_username} won ${amount} ${getCurrency(amount)}! ${
          EMOTES.GAMBLE.WIN
        } Current balance: ${points} ${getCurrency(points)}`,
      );
    } else {
      points -= amount;
      twitch.say(
        channel,
        `${user.twitch_username} lost ${amount} ${getCurrency(amount)}. ${
          EMOTES.GAMBLE.LOST
        } Current balance: ${points} ${getCurrency(points)}`,
      );
    }
  } else if (amount > user.cash) {
    twitch.say(channel, replies.notEnough);
    return;
  }

  if (user.twitch_id) {
    await setTwitchUser(user.twitch_id, { cash: points });
  }
};
