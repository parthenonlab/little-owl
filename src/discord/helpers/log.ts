import { ColorResolvable, EmbedBuilder } from 'discord.js';

import { CONFIG } from '@/constants';
import { LogProps } from '@/interfaces/bot';

import { discord } from '@/lib/clients';
import { getENV } from '@/lib/config';

const typeMap = {
  activity: {
    channel: CONFIG.CHANNELS.LOGS.ACTIVITY,
    color: CONFIG.COLORS.BLUE,
  },
  alert: {
    channel: CONFIG.CHANNELS.LOGS.ALERT,
    color: CONFIG.COLORS.PINK,
  },
  announce: {
    channel: process.env.STAGING
      ? CONFIG.CHANNELS.ADMIN.STAGE
      : CONFIG.CHANNELS.ADMIN.OWL,
    color: CONFIG.COLORS.BLUE,
  },
  deleted: {
    channel: CONFIG.CHANNELS.LOGS.DELETED,
    color: CONFIG.COLORS.RED,
  },
  error: {
    channel: CONFIG.CHANNELS.LOGS.ERROR,
    color: CONFIG.COLORS.RED,
  },
  leave: {
    channel: CONFIG.CHANNELS.LOGS.LEAVE,
    color: CONFIG.COLORS.YELLOW,
  },
  user: {
    channel: CONFIG.CHANNELS.LOGS.USER,
    color: CONFIG.COLORS.BLUE,
  },
};

/**
 * Send an embed message to a Discord log channel based on log type.
 *
 * @param props - Log properties including type, title, description, and optional media fields.
 */
export const log = ({
  type,
  title,
  description,
  image,
  authorIcon,
  thumbnail,
  footer,
}: LogProps) => {
  const { ADMIN_SERVER_ID } = getENV();

  const server = discord.guilds.cache.get(ADMIN_SERVER_ID);

  if (server && server.available) {
    const channel = server.channels.cache.get(typeMap[type].channel);

    if (channel) {
      const botEmbed = new EmbedBuilder()
        .setColor(typeMap[type].color as ColorResolvable)
        .setDescription(description);

      if (authorIcon) {
        botEmbed.setAuthor({
          name: `${server.name} Server`,
          iconURL: authorIcon || server.iconURL() || '',
        });
      }

      if (title) botEmbed.setTitle(title);
      if (image) botEmbed.setImage(image);
      if (thumbnail) botEmbed.setThumbnail(thumbnail);
      if (footer) botEmbed.setFooter({ text: footer });

      if (channel.isTextBased()) channel.send({ embeds: [botEmbed] });
    }
  }
};
