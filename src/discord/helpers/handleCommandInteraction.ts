import {
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
} from 'discord.js';

import { CONFIG, EMOJIS } from '@/constants';
import { BotState } from '@/interfaces/bot';
import { findOrCreateDiscordUser } from '@/services/user';

import * as dc from '../commands';
import { reply } from './reply';

export const handleCommandInteraction = async (
  state: BotState,
  interaction: ChatInputCommandInteraction
) => {
  if (interaction.user.bot) return;

  const replyNoBot = () => {
    reply({
      content: `I'm only accepting human members for this command. ${EMOJIS.CUSTOM.BOT}`,
      ephemeral: true,
      interaction: interaction,
    });
  };

  // command: link
  if (interaction.commandName === dc.AccountLink.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.AccountLink.execute(interaction, user);
  }

  // command: unlink
  else if (interaction.commandName === dc.AccountUnlink.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.AccountUnlink.execute(interaction, user);
  }

  // command: help
  else if (interaction.commandName === dc.Help.getName()) {
    return dc.Help.execute(interaction);
  }

  // command: sleep
  else if (interaction.commandName === dc.Sleep.getName()) {
    return dc.Sleep.execute(state, interaction);
  }

  // command: star
  else if (interaction.commandName === dc.Star.getName()) {
    const options = interaction.options as CommandInteractionOptionResolver;
    const recipient = options.getUser('user');

    if (!recipient) return;
    if (recipient.bot) return replyNoBot();

    return dc.Star.execute(interaction, recipient);
  }

  const isInCasinoChannel =
    interaction.channelId === CONFIG.CHANNELS.MAIN.CASINO ||
    interaction.channelId === CONFIG.CHANNELS.MAIN.STAGE;

  const isInBotChannel =
    interaction.channelId === CONFIG.CHANNELS.MAIN.CASINO ||
    interaction.channelId === CONFIG.CHANNELS.MAIN.OWL ||
    interaction.channelId === CONFIG.CHANNELS.MAIN.STAGE;

  if (!isInBotChannel) {
    reply({
      content: 'Please use this command in one of the bot channels.',
      ephemeral: true,
      interaction: interaction,
    });
    return;
  }

  // command: points
  if (interaction.commandName === dc.Points.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.Points.execute(interaction, user);
  }

  // command: gamble
  else if (interaction.commandName === dc.Gamble.getName()) {
    if (!isInCasinoChannel) {
      reply({
        content: 'Please use the #casino channel to gamble your points.',
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.Gamble.execute(interaction, user);
  }

  // command: redeem
  else if (interaction.commandName === dc.Redeem.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.Redeem.execute(interaction, user);
  }

  // command: profile
  else if (interaction.commandName === dc.Profile.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.Profile.execute(interaction, user);
  }

  // command: leaderboard
  else if (interaction.commandName === dc.Leaderboard.getName()) {
    return dc.Leaderboard.execute(interaction);
  }

  // command: give
  else if (interaction.commandName === dc.Give.getName()) {
    const options = interaction.options as CommandInteractionOptionResolver;
    const mentioned = options.getUser('user');

    if (!mentioned) return;
    if (mentioned.bot) return replyNoBot();

    const user = await findOrCreateDiscordUser(interaction.user);
    const recipient = await findOrCreateDiscordUser(mentioned);

    if (!user || !recipient) return;
    return dc.Give.execute(interaction, user, mentioned);
  }

  // command: bonus
  else if (interaction.commandName === dc.Bonus.getName()) {
    const options = interaction.options as CommandInteractionOptionResolver;
    const mentioned = options.getUser('user');

    if (!mentioned) return;
    if (mentioned.bot) return replyNoBot();

    const recipient = await findOrCreateDiscordUser(mentioned);

    if (!recipient) return;
    return dc.Bonus.execute(interaction, mentioned);
  }

  // command: coinflip
  else if (interaction.commandName === dc.CoinFlip.getName()) {
    return dc.CoinFlip.execute(interaction);
  }

  // command: 8ball
  else if (interaction.commandName === dc.EightBall.getName()) {
    return dc.EightBall.execute(interaction);
  }
};
