import { ActivityType, Client, Events, GatewayIntentBits } from 'discord.js';

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

discord.on(Events.ClientReady, () => {
  console.log('🦉 Little Owl: Discord.js Connected');

  discord.user?.setActivity({
    name: !process.env.STAGING
      ? 'IN DEV MODE'
      : `I'm Athena's little companion <3`,
    type: ActivityType.Custom,
  });
});

discord.login(process.env.DISCORD_TOKEN);

export { discord };
