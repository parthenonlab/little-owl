import { ColorResolvable, EmbedBuilder, MessageFlags } from 'discord.js';

import { CONFIG } from '@/constants';
import { ReplyProps } from '@/interfaces/bot';
import { logger } from '@/lib/logger';

/**
 * Send an embed reply to a Discord interaction.
 *
 * @param props.content - The text content to display in the embed description.
 * @param props.ephemeral - Whether the reply is only visible to the invoking user.
 * @param props.interaction - The Discord command interaction to reply to.
 */
export const reply = async ({
  content,
  ephemeral = false,
  interaction,
}: ReplyProps) => {
  try {
    const embed = new EmbedBuilder()
      .setColor(CONFIG.COLORS.BLUE as ColorResolvable)
      .setDescription(content);

    await interaction.reply({
      embeds: [embed],
      ...(ephemeral && { flags: MessageFlags.Ephemeral }),
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        command: interaction.commandName,
        discordId: interaction.user.id,
      },
      'Failed to send reply',
    );
  }
};
