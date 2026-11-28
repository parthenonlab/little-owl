import { Message, PartialMessage } from 'discord.js';

import { truncateAtWord } from '@/lib/utils';

import { log } from '../helpers';

// Keeps the content within the 4096-character embed description limit
const MAX_CONTENT_LENGTH = 3500;

export const onMessageDelete = async (message: Message | PartialMessage) => {
  const { attachments, author, cleanContent } = message;

  const lines = [
    `Message Deleted In: ${message.channel}`,
    `Author: ${author?.username ?? 'Unknown'}`,
  ];

  if (cleanContent) {
    lines.push(
      `\nContent: ${truncateAtWord(cleanContent, MAX_CONTENT_LENGTH)}`,
    );
  }

  if (attachments.size > 0) {
    lines.push('\nAttached Files:', ...attachments.map(file => file.url));
  }

  const footer = [
    author && `Discord User ID: ${author.id}`,
    `Posted on ${message.createdAt}`,
  ]
    .filter(Boolean)
    .join('\n');

  log({
    type: 'messages',
    description: lines.join('\n'),
    authorIcon: message.guild?.iconURL() || undefined,
    thumbnail: author?.displayAvatarURL() || undefined,
    footer,
  });
};
