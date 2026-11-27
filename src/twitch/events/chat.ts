import { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base';

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
import { BotState } from '@/interfaces/bot';
import { getCurrency, isNumber, parseSubMonths } from '@/lib/utils';

import {
  findOrCreateTwitchUser,
  getTwitchUserByName,
  incTwitchUser,
  setTwitchUser,
} from '@/services/user';

import { onBonus, onGamble, onGive } from '../commands';
import { say } from '../helpers/say';

import { onCheer } from './cheer';

const infoCommands = ['bsky', 'discord', 'dstmods', 'steam', 'switch', 'web'];

export const onChat = async (
  state: BotState,
  event: EventSubChannelChatMessageEvent,
) => {
  const { chatterDisplayName, chatterId, chatterName } = event;
  const message = event.messageText;
  const ids = state.twitch;

  if (chatterId === ids.botId) return;
  if (IGNORE_LIST.includes(chatterName)) return;

  if (event.isCheer) return onCheer(event);

  const user = await findOrCreateTwitchUser(chatterId, chatterName);
  if (!user) return;

  const subMonths = parseSubMonths(event.getBadgeInfo('subscriber'));

  if (subMonths > user.sub_months) {
    await setTwitchUser(chatterId, { sub_months: subMonths });
  }

  const redeemId = event.rewardId;

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
      description: `${chatterName} has claimed ${points} channel points to ${points} ${CONFIG.CURRENCY.PLURAL}!`,
    });

    await incTwitchUser(chatterId, 'cash', points);
    return;
  }

  if (message.startsWith('!')) {
    const args = message.slice(1).split(' ');
    const command = args.shift()?.toLowerCase();

    if (!command) return;
    if (!COMMAND_MAP.includes(command)) return;

    // commands that do not expect an argument

    if (command === COPY.POINTS.NAME) {
      return say(
        ids,
        `${chatterDisplayName} you have ${user.cash} ${getCurrency(user.cash)}`,
      );
    }

    if (infoCommands.includes(command)) {
      return say(ids, COPY.INFO[command]);
    }

    if (command === COPY.LURK.NAME) {
      return say(
        ids,
        `${chatterDisplayName} has disappeared into the shadows ${EMOTES.LURK.DEFAULT}`,
      );
    }

    if (command === COPY.COMMANDS.NAME) {
      return say(ids, URLS.COMMANDS);
    }

    // commands that expect at least one (1) argument

    if (command === COPY.GAMBLE.NAME) {
      return onGamble(ids, user, args);
    }

    // commands that expect a recipient in the argument

    const recipientName = args[0]?.startsWith('@') ? args[0].slice(1) : null;

    if (!recipientName) return;

    if (command === COPY.HUG.NAME) {
      return say(
        ids,
        `${EMOTES.HUG.LEFT} ${chatterDisplayName} hugs ${recipientName} ${EMOTES.HUG.RIGHT}`,
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
      return onGive(ids, user, recipient, value);
    }

    if (command === COPY.BONUS.NAME) {
      if (chatterId !== event.broadcasterId) return;
      return onBonus(ids, recipient, value);
    }
  }

  // if message is not a command

  state.twitchChatQueue += 1;

  const words = message.split(/ +/g);
  const pattern = /[A-Za-z].{2,}/;

  const isValid = words.length > 2 && words.some(word => pattern.test(word));

  if (!isValid) return;

  await incTwitchUser(chatterId, 'cash', 1);
};
