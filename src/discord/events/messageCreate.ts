import { Message } from 'discord.js';

import { CONFIG, EMOJIS } from '@/constants';
import { LogCode } from '@/enums/logs';
import { discord } from '@/lib/clients';
import { getENV, isFeatureEnabled } from '@/lib/config';
import { formatError, truncateAtWord } from '@/lib/utils';
import { findOrCreateDiscordUser, incDiscordUser } from '@/services/user';

import { fixTwitterLinks, log } from '../helpers';

const MAX_MESSAGE_LENGTH = 2000;

/**
 * Repost a message with x.com/twitter.com links rewritten to fixvx.com,
 * then delete the original.
 *
 * @param message - The incoming Discord message.
 * @returns True if the message was reposted and deleted.
 */
const repostFixedTwitterLinks = async (message: Message): Promise<boolean> => {
  if (!isFeatureEnabled('FIXVX')) return false;
  if (!message.channel.isSendable()) return false;

  const fixed = fixTwitterLinks(message.content);
  if (!fixed) return false;

  const content = truncateAtWord(
    `${message.author}: ${fixed}`,
    MAX_MESSAGE_LENGTH,
  );

  try {
    await message.channel.send({
      content,
      files: [...message.attachments.values()],
      allowedMentions: { parse: [] },
    });
    await message.delete();
    return true;
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
    return false;
  }
};

export const onMessageCreate = async (message: Message) => {
  if (!message.guild?.available) return;
  if (!message.channel.isTextBased()) return;
  if (!message.member) return;
  if (message.author.system) return;
  if (message.author.bot && message.author.id !== discord.user?.id) return;

  const { ADMIN_SERVER_ID, SERVER_ID } = getENV();

  if (message.guild.id === ADMIN_SERVER_ID) {
    const server = discord.guilds.cache.get(SERVER_ID);
    if (!server?.available) return;

    let channel = null;

    if (message.channel.id === CONFIG.CHANNELS.ADMIN.OWL) {
      channel = server.channels.cache.get(CONFIG.CHANNELS.MAIN.OWL);
    } else if (message.channel.id === CONFIG.CHANNELS.ADMIN.PATCH) {
      channel = server.channels.cache.get(CONFIG.CHANNELS.MAIN.PATCH);
    } else if (message.channel.id === CONFIG.CHANNELS.ADMIN.STAGE) {
      channel = server.channels.cache.get(CONFIG.CHANNELS.MAIN.STAGE);
    }

    if (channel?.isTextBased()) {
      channel.send({
        content: message.content,
        embeds: [...message.embeds],
        files: [...message.attachments.values()],
      });
    }

    return;
  }

  if (message.guild.id !== SERVER_ID) return;
  if (message.author.id === discord.user?.id) return;

  const isReposted = await repostFixedTwitterLinks(message);

  const owlRegex = /\blittle\s?owl\b/i;
  const contentLowerCase = message.content.toLowerCase();
  const hasLittleOwl = owlRegex.test(contentLowerCase);

  // add a reaction if the message mentions the bot
  if (
    !isReposted &&
    ((discord.user && message.mentions.has(discord.user)) || hasLittleOwl)
  ) {
    await message.react(EMOJIS.CUSTOM.OWL);
  }

  const words = message.content.split(/ +/g);
  const wordRegex = new RegExp('[A-Za-z].{2,}');

  const isValidMsg =
    words.length > 2 && words.some(word => wordRegex.test(word));
  const isValidAttachment = !!message.attachments.first();

  const incAmount = isValidAttachment ? 2 : 1;
  const isValid = isValidMsg || isValidAttachment;

  if (!isValid) return;

  await findOrCreateDiscordUser(message.member.user);
  await incDiscordUser(message.member.id, 'cash', incAmount);
};
