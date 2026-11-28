import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';

import { logger } from '@/lib/logger';

import {
  AccountLink,
  Bonus,
  Claim,
  CoinFlip,
  EightBall,
  Explore,
  Gamble,
  Give,
  Help,
  Inventory,
  Leaderboard,
  Points,
  Pokedex,
  Profile,
  Shop,
  Sleep,
  Star,
} from '../commands';

/**
 * Register all Discord slash commands via the REST API.
 * Registers production commands to the main guild, stage commands to the admin guild,
 * and global commands application-wide.
 */
export const registerDiscordCommands = (): void => {
  if (!process.env.DISCORD_TOKEN) {
    logger.fatal('Discord register command missing token');
    process.exit(1);
  }

  if (!process.env.DISCORD_CLIENT_ID) {
    logger.fatal('Discord register command missing client ID');
    process.exit(1);
  }

  if (!process.env.SERVER_ID) {
    logger.fatal('Discord register command missing server ID');
    process.exit(1);
  }

  if (!process.env.ADMIN_SERVER_ID) {
    logger.fatal('Discord register command missing admin server ID');
    process.exit(1);
  }

  const commands = [];
  const commandsGlobal = [];
  const commandsStage = [];

  // commands ready for production should be added here
  commands.push(AccountLink.data.toJSON());
  commands.push(Bonus.data.toJSON());
  commands.push(Claim.data.toJSON());
  commands.push(CoinFlip.data.toJSON());
  commands.push(EightBall.data.toJSON());
  commands.push(Explore.data.toJSON());
  commands.push(Gamble.data.toJSON());
  commands.push(Give.data.toJSON());
  commands.push(Inventory.data.toJSON());
  commands.push(Leaderboard.data.toJSON());
  commands.push(Points.data.toJSON());
  commands.push(Pokedex.data.toJSON());
  commands.push(Profile.data.toJSON());
  commands.push(Shop.data.toJSON());
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
          process.env.SERVER_ID,
        ),
        { body: commands },
      )
      .then(_data => logger.info('Discord PROD commands registered'))
      .catch(error =>
        logger.error(
          { err: error },
          'Discord PROD command registration failed',
        ),
      );

  if (commandsGlobal.length > 0)
    rest
      .put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
        body: commandsGlobal,
      })
      .then(_data => logger.info('Discord GLOBAL commands registered'))
      .catch(error =>
        logger.error(
          { err: error },
          'Discord GLOBAL command registration failed',
        ),
      );

  if (commandsStage.length > 0)
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID,
          process.env.ADMIN_SERVER_ID,
        ),
        { body: commandsStage },
      )
      .then(_data => logger.info('Discord STAGE commands registered'))
      .catch(error =>
        logger.error(
          { err: error },
          'Discord STAGE command registration failed',
        ),
      );
};
