import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';

import { getENV } from '@/lib/config';
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
  const { ADMIN_SERVER_ID, DISCORD_CLIENT_ID, DISCORD_TOKEN, SERVER_ID } =
    getENV();

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

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  if (commands.length > 0)
    rest
      .put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, SERVER_ID), {
        body: commands,
      })
      .then(_data => logger.info('Discord PROD commands registered'))
      .catch(error =>
        logger.error(
          { err: error },
          'Discord PROD command registration failed',
        ),
      );

  if (commandsGlobal.length > 0)
    rest
      .put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
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
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, ADMIN_SERVER_ID),
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
