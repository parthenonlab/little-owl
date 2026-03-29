/**
 * Capitalizes every word in a string.
 *
 * @param value - The input string to capitalize.
 * @returns The string with every word capitalized.
 */
export const capitalize = (value: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    return '';
  }

  return value
    .split(' ')
    .map(word =>
      word.length > 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : '',
    )
    .join(' ');
};
