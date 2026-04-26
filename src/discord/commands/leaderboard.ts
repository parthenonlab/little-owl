import {
  ColorResolvable,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { CONFIG, COPY } from '@/constants';
import { LogCode } from '@/enums/logs';
import { getDiscordLeaderboard } from '@/services/user';

import { checkFeatureEnabled, log } from '../helpers';

export const Leaderboard = {
  data: new SlashCommandBuilder()
    .setName(COPY.LEADERBOARD.NAME)
    .setDescription(COPY.LEADERBOARD.DESCRIPTION),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!(await checkFeatureEnabled('LEADERBOARD', interaction))) return;

    try {
      const leaderboardUsers = await getDiscordLeaderboard('cash', 5);

      if (!leaderboardUsers.length) {
        await interaction.reply({
          content: `Awkward.. it looks like nobody has any ${CONFIG.CURRENCY.SINGLE} right now.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const medals = ['🥇', '🥈', '🥉'];
      const NAME_WIDTH = 20;

      const formattedCash = leaderboardUsers.map(u => u.cash.toLocaleString());
      const cashWidth = Math.max(...formattedCash.map(c => c.length));

      const rows = leaderboardUsers.map((user, i) => {
        const name = (user.discord_name || user.discord_username || '')
          .slice(0, NAME_WIDTH)
          .padEnd(NAME_WIDTH);
        const cash = formattedCash[i].padStart(cashWidth);
        const medal = medals[i] ?? '';
        return `${i + 1}. ${name}  ${cash}  ${medal}`;
      });

      const description = `Here are the users with the highest ${CONFIG.CURRENCY.PLURAL}!`;
      const content = `\`\`\`\n${rows.join('\n')}\n\`\`\``;

      const embed = new EmbedBuilder()
        .setTitle('Leaderboard')
        .setColor(CONFIG.COLORS.BLUE as ColorResolvable)
        .addFields({ name: description, value: content });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      log({
        type: LogCode.Error,
        description: JSON.stringify(error),
      });
    }
  },
  getName: () => COPY.LEADERBOARD.NAME,
};
