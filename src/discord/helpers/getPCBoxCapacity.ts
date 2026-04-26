import { User } from '@parthenonlab/types';

/**
 * Calculate the PC Box capacity for a user.
 *
 * Base capacity is 300 for subscribers, 30 for standard users.
 * An additional 50 slots are granted if the user has both Discord and Twitch accounts linked.
 * Any purchased box space (box_space) is added on top.
 *
 * @param user - User document fields needed to determine capacity.
 * @returns The total number of Pokemon slots available in the user's PC Box.
 */
export const getPCBoxCapacity = (
  user: Pick<User, 'subscriber' | 'discord_id' | 'twitch_id' | 'box_space'>,
): number => {
  const base = user.subscriber ? 300 : 30;
  const linkedBonus = user.discord_id && user.twitch_id ? 50 : 0;
  return base + linkedBonus + user.box_space;
};
