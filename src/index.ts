import { version } from 'process';

if (parseInt(version.slice(1).split('.')[0], 10) < 22) {
  console.error('🦉 Error: Node Version 22 or Higher Is Required');
  process.exit(1);
}

require('dotenv').config();

import { Events } from 'discord.js';

import { DEFAULT_SHOP_STATE } from '@/constants/pokemon';
import * as de from '@/discord/events';
import { log, registerDiscordCommands } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { BotState, LogProps } from '@/interfaces/bot';
import { PokemonExplorePayload } from '@/interfaces/pokemon';
import { discord, eventsub } from '@/lib/clients';
import { connectDatabase, sleepTime } from '@/lib/config';
import { formatError } from '@/lib/utils';
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

const addEventListeners = async () => {
  discord.on('guildBanAdd', de.onGuildBanAdd);
  discord.on('guildMemberAdd', de.onGuildMemberAdd);
  discord.on('guildMemberRemove', de.onGuildMemberRemove);
  discord.on('guildMemberUpdate', de.onGuildMemberUpdate);
  discord.on('interactionCreate', de.onInteractionCreate.bind(null, state));
  discord.on('messageCreate', de.onMessageCreate);
  discord.on('messageDelete', de.onMessageDelete);
  discord.on('presenceUpdate', de.onPresenceUpdate.bind(null, state));

  console.log('🦉 Little Owl: Discord.js Event Listeners Added');
};

const addTwitchListeners = () => {
  eventsub.onSubscriptionCreateFailure((subscription, error) =>
    log({
      type: LogCode.Error,
      description: `EventSub subscription ${subscription.id} failed: ${formatError(error)}`,
    }),
  );
  eventsub.onRevoke((subscription, status) =>
    log({
      type: LogCode.Error,
      description: `EventSub subscription ${subscription.id} revoked: ${status}`,
    }),
  );

  const { botId, broadcasterId } = state.twitch;

  eventsub.onChannelChatMessage(broadcasterId, botId, event =>
    te.onChat(state, event),
  );
  eventsub.onChannelChatNotification(
    broadcasterId,
    botId,
    te.onChatNotification,
  );
  eventsub.onChannelModerate(broadcasterId, botId, te.onModerate);

  eventsub.start();

  console.log('🦉 Little Owl: EventSub Listener Started');
};

const addSleepListeners = async () => {
  process.on('SIGINT', async () => {
    console.log('🦉 Little Owl: Received SIGINT');
    await sleepTime(state);
  });
  process.on('SIGTERM', async () => {
    console.log('🦉 Little Owl: Received SIGTERM');
    await sleepTime(state);
  });

  console.log('🦉 Little Owl: Sleep Listeners Added');
};

/** Log to Discord now, or once the client is ready (log() drops messages before then). */
const logWhenReady = (props: LogProps) => {
  if (discord.isReady()) return log(props);
  discord.once(Events.ClientReady, () => log(props));
};

/**
 * Initialize Twitch auth. Failures are non-fatal so the Discord side keeps running.
 *
 * @returns Whether Twitch is available.
 */
const initTwitch = async (): Promise<boolean> => {
  try {
    state.twitch = await initTwitchAuth();
    console.log('🦉 Little Owl: Twitch Auth Initialized');
    return true;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    console.error(`🦉 Error: Twitch Disabled — ${reason}`);
    logWhenReady({
      type: LogCode.Error,
      description: `Twitch features are disabled until the bot is restarted.\n\nReason: ${reason}`,
    });
    return false;
  }
};

const init = async () => {
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
