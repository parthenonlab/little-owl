import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { CONFIG, COPY, EMOJIS, EMOTES, REWARD_MAP, URLS } from '@/constants';
import { UserDocument } from '@/interfaces/user';
import { twitch } from '@/lib/clients';
import { setDiscordUser } from '@/services/user';

import { reply } from '../helpers';

export const Redeem = {
  data: new SlashCommandBuilder()
    .setName(COPY.REDEEM.NAME)
    .setDescription(COPY.REDEEM.DESCRIPTION)
    .addStringOption(option =>
      option
        .setName(COPY.REDEEM.OPTION_NAME)
        .setDescription(COPY.REDEEM.OPTION_DESCRIPTION)
        .setRequired(true)
        .addChoices(
          ...REWARD_MAP.map(reward => ({
            name: reward.name,
            value: reward.name,
          }))
        )
    ),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument
  ) => {
    if (!CONFIG.FEATURES.REDEEM.ENABLED) {
      reply({
        content: COPY.DISABLED,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const replies = {
      invalidTwitch: `Please link your Twitch account to redeem rewards.\n${URLS.HOME}`,
      notEnough: `You don't have enough ${CONFIG.CURRENCY.PLURAL} to redeem this reward. ${EMOJIS.REDEEM.INVALID}`,
      notLive: `You can only redeem this reward when Athena is live on Twitch. ${EMOJIS.REDEEM.INVALID}`,
    };

    if (!user.twitch_id) {
      reply({
        content: replies.invalidTwitch,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const owner = await interaction.guild?.fetchOwner();
    const hasLiveRole = owner?.roles.cache.has(CONFIG.ROLES.LIVE.ID);

    if (!hasLiveRole) {
      reply({
        content: replies.notLive,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const selectedReward = interaction.options.getString('reward');
    const reward = REWARD_MAP.find(r => r.name === selectedReward)!;

    if (reward.cost > user.cash) {
      reply({
        content: replies.notEnough,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const updatedCash = user.cash - reward.cost;
    await setDiscordUser(interaction.user.id, { cash: updatedCash });

    const channel = process.env.CHANNELS!.split(',')[0];
    twitch.say(
      channel,
      `@${user.twitch_username} has redeemed: ${reward.name} ${EMOTES.REDEEM.DEFAULT}`
    );

    reply({
      content: `### REDEEMED: ${reward.name.toUpperCase()}\nYour current balance is: ${updatedCash} ${
        EMOJIS.CURRENCY
      }`,
      ephemeral: false,
      interaction: interaction,
    });
  },
  getName: (): string => {
    return COPY.REDEEM.NAME;
  },
};
