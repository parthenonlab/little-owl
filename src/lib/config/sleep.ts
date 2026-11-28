import mongoose from 'mongoose';

import { closeBrowser } from '@/discord/helpers/getBrowser';
import { BotState } from '@/interfaces/bot';
import { logger } from '@/lib/logger';

import { discord, eventsub } from '../clients';

/**
 * Gracefully shut down the bot by stopping all scheduled tasks and disconnecting all clients.
 * Stops cron jobs, disconnects Discord.js, EventSub, and MongoDB, then exits the process.
 *
 * @param state - The current bot state containing active timers.
 */
export const sleepTime = async (state: BotState) => {
  logger.info('Preparing for sleep..');

  // stop all node-cron scheduled tasks
  state.timers.forEach(job => job.stop());
  logger.info('Scheduled tasks stopped');

  // close Puppeteer browser
  await closeBrowser();
  logger.info('Puppeteer browser closed');

  // disconnect Discord.js client
  discord.destroy();
  logger.info('Discord.js disconnected');

  // stop EventSub listener (closes its WebSockets)
  eventsub.stop();
  logger.info('EventSub stopped');

  // disconnect MongoDB client
  if (mongoose.connection.readyState === 1) {
    // intentional, so don't report it as a lost connection
    mongoose.connection.removeAllListeners('disconnected');
    await mongoose.disconnect();
    logger.info('Database disconnected');
  }

  logger.info('Good night!');
  process.exit(0);
};
