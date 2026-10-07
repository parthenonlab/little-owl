/**
 * Truncate text to a max length without cutting through a word or link.
 *
 * @param text - Text to truncate.
 * @param maxLength - Max length of the result, including the ellipsis.
 * @returns The original text if it fits, otherwise the truncated text with an ellipsis.
 */
export const truncateAtWord = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength - 1);
  const lastSpace = sliced.search(/\s\S*$/);

  // fall back to a hard cut if there is no whitespace to break on
  if (lastSpace <= 0) return `${sliced}…`;

  return `${sliced.slice(0, lastSpace)}…`;
};
