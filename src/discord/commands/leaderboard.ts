import {
  ColorResolvable,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { LogCode } from '@/enums/logs';
import { getDiscordLeaderboard } from '@/services/user';

import { log, reply } from '../helpers';

export const Leaderboard = {
  data: new SlashCommandBuilder()
    .setName(COPY.LEADERBOARD.NAME)
    .setDescription(COPY.LEADERBOARD.DESCRIPTION),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!CONFIG.FEATURES.LEADERBOARD.ENABLED) {
      reply({
        content: COPY.DISABLED,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const description = `Here are the users with the highest ${CONFIG.CURRENCY.PLURAL}!`;
    const leaderboardUsers = await getDiscordLeaderboard('cash', 5);

    if (!leaderboardUsers.length) {
      return await interaction.reply({
        content: `Awkward.. it looks like nobody has any ${CONFIG.CURRENCY.SINGLE} right now.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const botEmbed = new EmbedBuilder()
      .setTitle('Leaderboard')
      .setColor(CONFIG.COLORS.YELLOW as ColorResolvable);

    let content = '';
    leaderboardUsers.forEach((user, i) => {
      const name = user.discord_name || user.discord_username || '';

      switch (i) {
        case 0:
          content += `${i + 1}. ${name} ${EMOJIS.LEADERBOARD.FIRST}  •  ${
            user.cash
          }  ${EMOJIS.CURRENCY}\n`;
          break;
        case 1:
          content += `${i + 1}. ${name} ${EMOJIS.LEADERBOARD.SECOND}  •  ${
            user.cash
          }  ${EMOJIS.CURRENCY}\n`;
          break;
        case 2:
          content += `${i + 1}. ${name} ${EMOJIS.LEADERBOARD.THIRD}  •  ${
            user.cash
          }  ${EMOJIS.CURRENCY}\n`;
          break;
        default:
          content += `${i + 1}. ${name}  •  ${user.cash}  ${EMOJIS.CURRENCY}\n`;
      }
    });

    botEmbed.addFields({ name: description, value: content });

    try {
      await interaction.reply({ embeds: [botEmbed] });
    } catch (error) {
      log({
        type: LogCode.Error,
        description: JSON.stringify(error),
      });
    }
    return;
  },
  getName: (): string => {
    return COPY.LEADERBOARD.NAME;
  },
};
