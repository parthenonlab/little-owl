import {
  GuildTextBasedChannel,
  Message,
  PartialMessage,
  ReadonlyCollection,
} from 'discord.js';

import { truncateAtWord } from '@/lib/utils';

import { log } from '../helpers';

// Keeps the list within the 4096-character embed description limit
const MAX_LIST_LENGTH = 3500;
const MAX_LINE_LENGTH = 200;

const formatLine = (message: Message<true> | PartialMessage<true>) => {
  const author = message.author?.username ?? 'Unknown';
  const content = message.cleanContent
    ? truncateAtWord(message.cleanContent, MAX_LINE_LENGTH)
    : '(no text)';

  return `**${author}:** ${content}`;
};

/**
 * Log a bulk delete (e.g. a moderator purge) as one embed listing the removed messages, oldest first.
 * Only messages discord.js had cached are received, so the count can be lower than what was purged.
 *
 * @param messages - The deleted messages.
 * @param channel - The channel they were deleted from.
 */
export const onMessageDeleteBulk = async (
  messages: ReadonlyCollection<string, Message<true> | PartialMessage<true>>,
  channel: GuildTextBasedChannel,
) => {
  if (!messages.size) return;

  const sorted = [...messages.values()].sort(
    (a, b) => a.createdTimestamp - b.createdTimestamp,
  );

  const lines: string[] = [];
  let length = 0;

  for (const message of sorted) {
    const line = formatLine(message);
    if (length + line.length + 1 > MAX_LIST_LENGTH) break;

    lines.push(line);
    length += line.length + 1;
  }

  const omitted = sorted.length - lines.length;
  if (omitted > 0) lines.push(`…and ${omitted} more`);

  log({
    type: 'messages',
    title: `${messages.size} Messages Bulk Deleted`,
    description: [`Deleted In: ${channel}`, '', ...lines].join('\n'),
  });
};
