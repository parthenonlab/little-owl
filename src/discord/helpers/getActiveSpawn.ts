import { ActiveSpawn } from '@/interfaces/pokemon';

const DAY_START_HOUR = 4;
const DAY_END_HOUR = 17;

/**
 * Returns the current active spawn window based on the hour of day.
 * Day: 4:00 AM – 5:59 PM | Night: 6:00 PM – 3:59 AM
 *
 * @returns The current active spawn time
 */
export const getActiveSpawn = (): ActiveSpawn => {
  const hour = new Date().getHours();
  return hour >= DAY_START_HOUR && hour <= DAY_END_HOUR ? 'day' : 'night';
};
