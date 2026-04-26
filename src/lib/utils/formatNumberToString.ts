/**
 * Formats a number as a locale string.
 *
 * @param n - The numeric price to format
 * @returns The number formatted with US locale separators
 */
export const formatNumberToString = (n: number): string => {
  return n.toLocaleString('en-US');
};
