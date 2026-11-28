import { Message, PartialMessage } from 'discord.js';

import { truncateAtWord } from '@/lib/utils';

import { log } from '../helpers';

// Keeps both versions within the 4096-character embed description limit
const MAX_CONTENT_LENGTH = 1800;

const formatContent = (content: string | null) =>
  content ? truncateAtWord(content, MAX_CONTENT_LENGTH) : '(empty)';

/**
 * Log edited messages. Edits that don't change the text (e.g. link previews loading) are ignored.
 * The old text is only known if the message was cached, i.e. sent since the bot last started.
 *
 * @param oldMessage - The message before the edit (partial if it wasn't cached).
 * @param newMessage - The message after the edit.
 */
export const onMessageUpdate = async (
  oldMessage: Message | PartialMessage,
  newMessage: Message | PartialMessage,
) => {
  if (!newMessage.inGuild()) return;
  if (newMessage.author.bot) return;
  if (
    !oldMessage.partial &&
    oldMessage.cleanContent === newMessage.cleanContent
  )
    return;

  const before = oldMessage.partial
    ? '(not cached; sent before the bot last started)'
    : formatContent(oldMessage.cleanContent);

  log({
    type: 'messages',
    title: 'Message Edited',
    description: [
      `Message Edited In: ${newMessage.channel}`,
      `Author: ${newMessage.author.username}`,
      `\nBefore: ${before}`,
      `\nAfter: ${formatContent(newMessage.cleanContent)}`,
      `\n[Jump to message](${newMessage.url})`,
    ].join('\n'),
    thumbnail: newMessage.author.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${newMessage.author.id}\nPosted on ${newMessage.createdAt}`,
  });
};
