/**
 * Formats a price as a locale string wrapped in backtick code formatting.
 *
 * @param price - The numeric price to format
 * @returns The price formatted with US locale separators, wrapped in backticks
 */
export const formatPriceToCode = (price: number): string => {
  return `\`${price.toLocaleString('en-US')}\``;
};
