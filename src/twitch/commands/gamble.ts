import { CONFIG, EMOTES } from '@/constants';
import { UserDocument } from '@/interfaces/user';

import { twitch } from '@/lib/clients';
import { getCurrency, isNumber, weightedRandom } from '@/lib/utils';

import { updateActivity } from '@/services/activity';
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

  const result = weightedRandom(probability);
  const won = result === 'win';

  let wager: number;

  if (value === 'all') {
    wager = user.cash;
  } else if (value === 'half') {
    wager = Math.round(user.cash / 2);
  } else if (amount > user.cash) {
    twitch.say(channel, replies.notEnough);
    return;
  } else {
    wager = amount;
  }

  const newBalance = won ? user.cash + wager : user.cash - wager;

  if (won) {
    twitch.say(
      channel,
      `${user.twitch_username} won ${wager} ${getCurrency(wager)}! ${
        EMOTES.GAMBLE.WIN
      } Current balance: ${newBalance} ${getCurrency(newBalance)}`,
    );
  } else if (newBalance === 0) {
    twitch.say(channel, replies.lostAll);
  } else {
    twitch.say(
      channel,
      `${user.twitch_username} lost ${wager} ${getCurrency(wager)}. ${
        EMOTES.GAMBLE.LOST
      } Current balance: ${newBalance} ${getCurrency(newBalance)}`,
    );
  }

  await setTwitchUser(user.twitch_id!, { cash: newBalance });

  if (user.discord_id) {
    await updateActivity(user.discord_id, {
      $inc: {
        [`gamble.${won ? 'total_wins' : 'total_losses'}`]: 1,
        [`gamble.${won ? 'total_won' : 'total_lost'}`]: wager,
      },
      $set: { 'gamble.last_used': new Date() },
      ...(won && { $max: { 'gamble.biggest_win': wager } }),
    });
  }
};
