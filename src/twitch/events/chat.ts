import {
  COMMAND_MAP,
  CONFIG,
  COPY,
  EMOTES,
  IGNORE_LIST,
  URLS,
} from '@/constants';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { BotState, ObjectProps } from '@/interfaces/bot';

import { twitch } from '@/lib/clients';
import { getCurrency, isNumber } from '@/lib/utils';

import {
  findOrCreateTwitchUser,
  getTwitchUserByName,
  incTwitchUser,
} from '@/services/user';

import { onBonus, onGamble, onGive } from '../commands';

const infoCommands = ['bsky', 'discord', 'dstmods', 'steam', 'switch', 'web'];

export const onChat = async (
  state: BotState,
  channel: string,
  userstate: ObjectProps,
  message: string,
  self: boolean,
) => {
  if (self) return;
  if (IGNORE_LIST.includes(userstate.username)) return;

  const user = await findOrCreateTwitchUser(userstate);
  if (!user) return;

  const redeemId = userstate['custom-reward-id'];

  if (redeemId) {
    let points = 0;

    switch (redeemId) {
      case CONFIG.TWITCH_REWARDS.REDEEM100:
        points = 100;
        break;
      case CONFIG.TWITCH_REWARDS.REDEEM500:
        points = 500;
        break;
      case CONFIG.TWITCH_REWARDS.REDEEM1K:
        points = 1000;
        break;
    }

    if (!points) return;

    log({
      type: LogCode.Activity,
      description: `${userstate.username} has claimed ${points} channel points to ${points} ${CONFIG.CURRENCY.PLURAL}!`,
    });

    await incTwitchUser(userstate['user-id'], 'cash', points);
    return;
  }

  if (message.startsWith('!')) {
    const args = message.slice(1).split(' ');
    const command = args.shift()?.toLowerCase();

    if (!command) return;
    if (!COMMAND_MAP.includes(command)) return;

    // commands that do not expect an argument

    if (command === COPY.POINTS.NAME) {
      return twitch.say(
        channel,
        `${userstate['display-name']} you have ${user.cash} ${getCurrency(
          user.cash,
        )}`,
      );
    }

    if (infoCommands.includes(command)) {
      return twitch.say(channel, COPY.INFO[command]);
    }

    if (command === COPY.LURK.NAME) {
      return twitch.say(
        channel,
        `/me ${userstate['display-name']} has disappeared into the shadows ${EMOTES.LURK.DEFAULT}`,
      );
    }

    if (command === COPY.COMMANDS.NAME) {
      return twitch.say(channel, URLS.COMMANDS);
    }

    // commands that expect at least one (1) argument

    if (command === COPY.GAMBLE.NAME) {
      return onGamble(channel, user, args);
    }

    // commands that expect a recipient in the argument

    const recipientName = args[0].slice(0, 1) === '@' ? args[0].slice(1) : null;

    if (!recipientName) return;

    if (command === COPY.HUG.NAME) {
      return twitch.say(
        channel,
        `${EMOTES.HUG.LEFT} ${userstate['display-name']} hugs ${recipientName} ${EMOTES.HUG.RIGHT}`,
      );
    }

    // commands that expect a recipient and value in the arguments

    const amount = args[1];

    if (!isNumber(amount)) return;

    const value = parseInt(args[1], 10);

    if (value < 1) return;

    const recipient = await getTwitchUserByName(recipientName);

    if (!recipient) return;

    if (command === COPY.GIVE.NAME) {
      return onGive(channel, user, recipient, value);
    }

    if (command === COPY.BONUS.NAME) {
      if (userstate.username !== channel.slice(1)) return;
      return onBonus(channel, recipient, value);
    }
  }

  // if message is not a command

  state.twitchChatQueue += 1;

  const words = message.split(/ +/g);
  const pattern = /[A-Za-z].{2,}/;

  const isValid = words.length > 2 && words.some(word => pattern.test(word));

  if (!isValid) return;

  await incTwitchUser(userstate['user-id'], 'cash', 1);
};
