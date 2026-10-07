const TWITTER_LINK_REGEX = /https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\//gi;

/**
 * Replace x.com and twitter.com links with fixvx.com for proper embeds.
 *
 * @param content - Message content to rewrite.
 * @returns Rewritten content, or null if no links were found.
 */
export const fixTwitterLinks = (content: string): string | null => {
  const fixed = content.replace(TWITTER_LINK_REGEX, 'https://fixvx.com/');
  return fixed === content ? null : fixed;
};
