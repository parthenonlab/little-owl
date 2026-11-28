import { ActivityType, Client, Events, GatewayIntentBits } from 'discord.js';

import { getENV } from '@/lib/config';
import { logger, withErrorLogging } from '@/lib/logger';
import { syncDiscordSubscribers } from '@/services/user';

const { DISCORD_TOKEN, SERVER_ID } = getENV();

const discord = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

const onReady = async () => {
  logger.info('Discord.js connected');

  const isStaging = process.env.STAGING;

  if (!isStaging) {
    const guild = await discord.guilds.fetch(SERVER_ID);

    if (guild.available) {
      await syncDiscordSubscribers(guild);
      logger.info('Subscribers synced');
    } else {
      logger.error(
        { guildId: SERVER_ID },
        'Guild unavailable for subscriber sync',
      );
    }
  }

  discord.user?.setActivity({
    name: isStaging ? 'IN DEV MODE' : `I'm Athena's little companion. <3`,
    type: ActivityType.Custom,
  });
};

discord.on(
  Events.ClientReady,
  withErrorLogging('Discord event handler failed', { event: 'ready' }, onReady),
);

discord.on(Events.Error, error =>
  logger.error({ err: error }, 'Discord.js client error'),
);
discord.on(Events.Warn, warning =>
  logger.warn({ warning }, 'Discord.js warning'),
);
discord.on(Events.ShardDisconnect, ({ code }, shardId) =>
  logger.warn({ code, shardId }, 'Discord.js shard disconnected'),
);
discord.on(Events.ShardReconnecting, shardId =>
  logger.info({ shardId }, 'Discord.js shard reconnecting'),
);
discord.on(Events.ShardResume, (shardId, replayedEvents) =>
  logger.info({ shardId, replayedEvents }, 'Discord.js shard resumed'),
);

discord.login(DISCORD_TOKEN).catch(error => {
  logger.fatal({ err: error }, 'Discord.js login failed');
  process.exit(1);
});

export { discord };
