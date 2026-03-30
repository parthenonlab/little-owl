import { ActiveSpawn } from '@/interfaces/pokemon';

/**
 * Day - 4:00 AM to 5:59 PM
 * Night - 6:00 PM to 3:59 AM
 * @returns The current active spawn time
 */
export const getActiveSpawn = (): ActiveSpawn => {
  const hour = new Date().getHours();
  return hour >= 4 && hour <= 17 ? 'day' : 'night';
};
