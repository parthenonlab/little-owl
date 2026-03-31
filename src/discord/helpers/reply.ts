import { ColorResolvable, EmbedBuilder, MessageFlags } from 'discord.js';

import { CONFIG } from '@/constants';
import { LogCode } from '@/enums/logs';
import { ReplyProps } from '@/interfaces/bot';

import { log } from './log';

/**
 * Send an embed reply to a Discord interaction.
 *
 * @param props.content - The text content to display in the embed description.
 * @param props.ephemeral - Whether the reply is only visible to the invoking user.
 * @param props.interaction - The Discord command interaction to reply to.
 */
export const reply = async ({
  content,
  ephemeral,
  interaction,
}: ReplyProps) => {
  try {
    const botEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLORS.BLUE as ColorResolvable)
      .setDescription(content);

    await interaction.reply({
      embeds: [botEmbed],
      ...(ephemeral && { flags: MessageFlags.Ephemeral }),
    });
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
  }
};
