/**
 * Parses a Twitch subscriber badge info value into a positive integer.
 *
 * @param value - The badge info (e.g. `event.getBadgeInfo('subscriber')`), which holds the cumulative months.
 * @returns The number of months, or 0 if the value is missing or invalid.
 */
export const parseSubMonths = (value: string | null | undefined): number => {
  const months = Number(value);
  return Number.isInteger(months) && months > 0 ? months : 0;
};
