import { UpdateQuery } from 'mongoose';

import { ActivityDocument, ActivityModel } from '@parthenonlab/models';
import { ActivityFields } from '@parthenonlab/types';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

/**
 * Delete the activity document for a Discord user.
 *
 * @param id - Discord user ID.
 * @returns The deleted activity document, or null if not found or on error.
 */
export const deleteActivity = async (
  id: string,
): Promise<ActivityDocument | null> => {
  try {
    return await ActivityModel.findOneAndDelete({ discord_id: id });
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/**
 * Get a single feature's activity data for a Discord user.
 *
 * @param id - Discord user ID.
 * @param feature - The activity feature to retrieve.
 * @returns The feature's activity data, or null if not found or on error.
 */
export const getActivity = async <K extends keyof ActivityFields>(
  id: string,
  feature: K,
): Promise<ActivityFields[K] | null> => {
  try {
    const activity = await ActivityModel.findOne(
      { discord_id: id },
      { _id: 0, [feature]: 1 },
    ).lean();
    return (activity?.[feature] as ActivityFields[K]) ?? null;
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/**
 * Update the activity document for a Discord user, creating it if it doesn't exist.
 *
 * @param id - Discord user ID.
 * @param update - MongoDB update query to apply.
 * @returns The updated activity document, or null on error.
 */
export const updateActivity = async (
  id: string,
  update: UpdateQuery<ActivityDocument>,
): Promise<ActivityDocument | null> => {
  try {
    return await ActivityModel.findOneAndUpdate({ discord_id: id }, update, {
      upsert: true,
      returnDocument: 'after',
    });
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};
