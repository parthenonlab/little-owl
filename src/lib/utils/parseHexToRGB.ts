/**
 * Parses a hex color string into its RGB components.
 * Supports both shorthand (#ABC) and full (#AABBCC) formats, with or without the #.
 *
 * @param hex - The hex color string to parse.
 * @returns An object with r, g, b values, or null if the input is invalid.
 */
export const parseHexToRGB = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);

  const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  const result = hexRegex.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};
