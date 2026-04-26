/**
 * Formats a number as a locale string wrapped in backtick code formatting.
 *
 * @param n - The numeric price to format
 * @returns The number formatted with US locale separators, wrapped in backticks
 */
export const formatNumberToCode = (n: number): string => {
  return `\`${n.toLocaleString('en-US')}\``;
};
