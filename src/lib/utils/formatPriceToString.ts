/**
 * Formats a price as a locale string.
 *
 * @param price - The numeric price to format
 * @returns The price formatted with US locale separators
 */
export const formatPriceToString = (price: number): string => {
  return price.toLocaleString('en-US');
};
