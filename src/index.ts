import { version } from 'process';

if (parseInt(version.slice(1).split('.')[0], 10) < 22) {
  console.error('🦉 Error: Node Version 22 or Higher Is Required');
  process.exit(1);
}

require('dotenv').config();

import * as de from '@/discord/events';
import * as te from '@/twitch/events';

import { DEFAULT_SHOP_STATE } from '@/constants/pokemon';
import { registerDiscordCommands } from '@/discord/helpers';

import { BotState } from '@/interfaces/bot';
import { PokemonExplorePayload } from '@/interfaces/pokemon';

import { discord, twitch } from '@/lib/clients';
import { connectDatabase, sleepTime } from '@/lib/config';

import { scheduleTasks } from '@/scheduler';

const state: BotState = {
  activityIndex: 1,
  cooldowns: {
    stream: new Date(),
  },
  exploreList: new Map<string, PokemonExplorePayload>(),
  reminderIndex: 0,
  shop: DEFAULT_SHOP_STATE,
  timers: [],
  twitchChatQueue: 0,
};

const addEventListeners = async () => {
  discord.on('guildBanAdd', de.onGuildBanAdd);
  discord.on('guildMemberAdd', de.onGuildMemberAdd);
  discord.on('guildMemberRemove', de.onGuildMemberRemove);
  discord.on('interactionCreate', de.onInteractionCreate.bind(null, state));
  discord.on('messageCreate', de.onMessageCreate);
  discord.on('messageDelete', de.onMessageDelete);
  discord.on('presenceUpdate', de.onPresenceUpdate.bind(null, state));

  console.log('🦉 Little Owl: Discord.js Event Listeners Added');

  twitch.on('ban', te.onBan);
  twitch.on('chat', te.onChat.bind(null, state));
  twitch.on('cheer', te.onCheer);
  twitch.on('join', te.onJoin);
  twitch.on('part', te.onPart);
  twitch.on('raided', te.onRaided);
  twitch.on('resub', te.onResub);
  twitch.on('subgift', te.onSubGift);
  twitch.on('submysterygift', te.onSubMysteryGift);
  twitch.on('subscription', te.onSubscription);
  twitch.on('timeout', te.onTimeout);

  console.log('🦉 Little Owl: TMI.js Event Listeners Added');
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

const init = async () => {
  await connectDatabase();
  await addEventListeners();
  await addSleepListeners();
  await scheduleTasks(state);
};

if (process.env.REGISTER) registerDiscordCommands();

init();
