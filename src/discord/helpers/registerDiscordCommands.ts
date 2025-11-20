import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';

import {
  AccountLink,
  AccountUnlink,
  Bonus,
  CoinFlip,
  EightBall,
  Gamble,
  Give,
  Help,
  Leaderboard,
  Points,
  Profile,
  Redeem,
  Sleep,
  Star,
} from '../commands';

export const registerDiscordCommands = (): void => {
  if (!process.env.DISCORD_TOKEN) {
    console.error('🦉 Error: Discord Register Command Missing Token.');
    process.exit(1);
  }

  if (!process.env.DISCORD_CLIENT_ID) {
    console.error('🦉 Error: Discord Register Command Missing Client ID.');
    process.exit(1);
  }

  if (!process.env.SERVER_ID) {
    console.error('🦉 Error: Discord Register Command Missing Server ID.');
    process.exit(1);
  }

  if (!process.env.ADMIN_SERVER_ID) {
    console.error(
      '🦉 Error: Discord Register Command Missing Admin Server ID.'
    );
    process.exit(1);
  }

  const commands = [];
  const commandsGlobal = [];
  const commandsStage = [];

  // commands ready for production should be added here
  commands.push(AccountLink.data.toJSON());
  commands.push(AccountUnlink.data.toJSON());
  commands.push(Bonus.data.toJSON());
  commands.push(CoinFlip.data.toJSON());
  commands.push(EightBall.data.toJSON());
  commands.push(Gamble.data.toJSON());
  commands.push(Give.data.toJSON());
  commands.push(Leaderboard.data.toJSON());
  commands.push(Points.data.toJSON());
  commands.push(Profile.data.toJSON());
  commands.push(Redeem.data.toJSON());
  commands.push(Star.data.toJSON());

  // commands in development for testing should be added here
  commandsStage.push(Sleep.data.toJSON());

  // global commands should be added here
  commandsGlobal.push(Help.data.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  if (commands.length > 0)
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID,
          process.env.SERVER_ID
        ),
        { body: commands }
      )
      .then(_data =>
        console.log('🦉 Little Owl: Discord PROD Commands Registered')
      )
      .catch(console.error);

  if (commandsGlobal.length > 0)
    rest
      .put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
        body: commandsGlobal,
      })
      .then(_data =>
        console.log('🦉 Little Owl: Discord GLOBAL Commands Registered')
      )
      .catch(console.error);

  if (commandsStage.length > 0)
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID,
          process.env.ADMIN_SERVER_ID
        ),
        { body: commandsStage }
      )
      .then(_data =>
        console.log('🦉 Little Owl: Discord STAGE Commands Registered')
      )
      .catch(console.error);
};
