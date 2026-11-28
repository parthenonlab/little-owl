import { version } from 'process';

if (parseInt(version.slice(1).split('.')[0], 10) < 22) {
  console.error('🦉 Error: Node Version 22 or Higher Is Required');
  process.exit(1);
}

require('dotenv').config();

import { ClientEvents } from 'discord.js';

import { DEFAULT_SHOP_STATE } from '@/constants/pokemon';
import * as de from '@/discord/events';

import {
  flushDiscordErrors,
  forwardErrorsToDiscord,
  registerDiscordCommands,
} from '@/discord/helpers';

import { BotState } from '@/interfaces/bot';
import { PokemonExplorePayload } from '@/interfaces/pokemon';
import { discord, eventsub } from '@/lib/clients';
import { connectDatabase, sleepTime } from '@/lib/config';
import { logger, withErrorLogging } from '@/lib/logger';
import { scheduleTasks } from '@/scheduler';
import { findOrCreateShop } from '@/services/shop';
import * as te from '@/twitch/events';
import { initTwitchAuth } from '@/twitch/helpers';

const state: BotState = {
  activityIndex: 1,
  cooldowns: {
    stream: new Date(),
  },
  exploreList: new Map<string, PokemonExplorePayload>(),
  reminderIndex: 0,
  shop: DEFAULT_SHOP_STATE,
  timers: [],
  twitch: { botId: '', broadcasterId: '' },
  twitchChatQueue: 0,
};

/** Add a Discord.js listener whose errors are logged with the event name. */
const onDiscord = <K extends keyof ClientEvents>(
  event: K,
  handler: (...args: ClientEvents[K]) => unknown,
) => {
  discord.on(
    event,
    withErrorLogging('Discord event handler failed', { event }, handler),
  );
};

/** Wrap an EventSub handler so its errors are logged with the subscription type. */
const safeEventSub = <A extends unknown[]>(
  event: string,
  handler: (...args: A) => unknown,
) => withErrorLogging('EventSub handler failed', { event }, handler);

const addEventListeners = async () => {
  onDiscord('guildBanAdd', de.onGuildBanAdd);
  onDiscord('guildBanRemove', de.onGuildBanRemove);
  onDiscord('guildMemberAdd', de.onGuildMemberAdd);
  onDiscord('guildMemberRemove', de.onGuildMemberRemove);
  onDiscord('guildMemberUpdate', de.onGuildMemberUpdate);
  onDiscord('interactionCreate', interaction =>
    de.onInteractionCreate(state, interaction),
  );
  onDiscord('messageCreate', de.onMessageCreate);
  onDiscord('messageDelete', de.onMessageDelete);
  onDiscord('messageDeleteBulk', de.onMessageDeleteBulk);
  onDiscord('messageUpdate', de.onMessageUpdate);
  onDiscord('presenceUpdate', (oldPresence, newPresence) =>
    de.onPresenceUpdate(state, oldPresence, newPresence),
  );

  logger.info('Discord.js event listeners added');
};

const addTwitchListeners = () => {
  eventsub.onSubscriptionCreateFailure((subscription, error) =>
    logger.error(
      { err: error, subscriptionId: subscription.id },
      'EventSub subscription failed',
    ),
  );
  eventsub.onRevoke((subscription, status) =>
    logger.error(
      { subscriptionId: subscription.id, status },
      'EventSub subscription revoked',
    ),
  );

  const { botId, broadcasterId } = state.twitch;

  eventsub.onChannelChatMessage(
    broadcasterId,
    botId,
    safeEventSub('channel.chat.message', event => te.onChat(state, event)),
  );
  eventsub.onChannelChatNotification(
    broadcasterId,
    botId,
    safeEventSub('channel.chat.notification', te.onChatNotification),
  );
  eventsub.onChannelModerate(
    broadcasterId,
    botId,
    safeEventSub('channel.moderate', te.onModerate),
  );

  eventsub.start();

  logger.info('EventSub listener started');
};

const addSleepListeners = async () => {
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT');
    await sleepTime(state);
  });
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM');
    await sleepTime(state);
  });

  logger.info('Sleep listeners added');
};

const addCrashListeners = () => {
  // Log and keep running; a stray rejection shouldn't take the bot down.
  process.on('unhandledRejection', reason => {
    logger.error({ err: reason }, 'Unhandled rejection');
  });

  // Process state is unknown after an uncaught exception, so log and exit.
  process.on('uncaughtException', async error => {
    logger.fatal({ err: error }, 'Uncaught exception');
    await flushDiscordErrors();
    process.exit(1);
  });
};

/**
 * Initialize Twitch auth. Failures are non-fatal so the Discord side keeps running.
 *
 * @returns Whether Twitch is available.
 */
const initTwitch = async (): Promise<boolean> => {
  try {
    state.twitch = await initTwitchAuth();
    logger.info('Twitch auth initialized');
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Twitch disabled until the bot is restarted');
    return false;
  }
};

const init = async () => {
  forwardErrorsToDiscord();
  addCrashListeners();
  await connectDatabase();

  const isTwitchReady = await initTwitch();

  const shopState = await findOrCreateShop();
  if (shopState) state.shop = shopState;

  await addEventListeners();
  if (isTwitchReady) addTwitchListeners();
  await addSleepListeners();
  scheduleTasks(state);
};

if (process.env.REGISTER) registerDiscordCommands();

init();
