/**
 * Checks whether a string represents a valid integer.
 *
 * @param value - The string to check.
 * @returns True if the string is a valid integer, false otherwise.
 */
export const isNumber = (value: string): boolean => {
  const regex = /^-?\d+$/;
  return regex.test(value);
};
