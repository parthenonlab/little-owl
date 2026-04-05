import { syncSubscribers } from '@/services/user';
import { ActivityType, Client, Events, GatewayIntentBits } from 'discord.js';
import { getENV } from '../config';

if (!process.env.DISCORD_TOKEN) {
  console.error('🦉 Error: Discord.js Missing Environment Variables');
  process.exit(1);
}

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

discord.on(Events.ClientReady, async () => {
  console.log('🦉 Little Owl: Discord.js Connected');

  const isStaging = process.env.STAGING;

  if (!isStaging) {
    const { SERVER_ID } = getENV();
    const guild = await discord.guilds.fetch(SERVER_ID);

    if (guild.available) {
      await syncSubscribers(guild);
      console.log('🦉 Little Owl: Subscribers Synced');
    } else {
      console.error('🦉 Little Owl: Guild Unavailable for Subscriber Sync');
    }
  }

  discord.user?.setActivity({
    name: isStaging ? 'IN DEV MODE' : `I'm Athena's little companion. <3`,
    type: ActivityType.Custom,
  });
});

discord.login(process.env.DISCORD_TOKEN);

export { discord };
