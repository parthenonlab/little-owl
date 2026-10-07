/**
 * Parses a Twitch sub months tag into a positive integer. TMI.js converts a top-level tag value of '1' into `true`.
 *
 * @param value - The raw tag value (e.g. `badge-info.subscriber` or `msg-param-cumulative-months`).
 * @returns The number of months, or 0 if the value is missing or invalid.
 */
export const parseSubMonths = (value: unknown): number => {
  const months = value === true ? 1 : Number(value);
  return Number.isInteger(months) && months > 0 ? months : 0;
};
