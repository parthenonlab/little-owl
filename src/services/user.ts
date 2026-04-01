import { User as DiscordUser } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

import { UserDocument } from '@parthenonlab/models';
import { User } from '@parthenonlab/types';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ObjectProps } from '@/interfaces/bot';
import { UserModel } from '@/models/user';

type NumericUserField = {
  [K in keyof User]: User[K] extends number ? K : never;
}[keyof User];

type PlatformFilter = { discord_id: string } | { twitch_id: string };

/**
 * Increment a field on a user document by platform filter.
 *
 * @param filter - MongoDB filter targeting a user by discord_id or twitch_id.
 * @param field - The numeric field to increment.
 * @param amount - The amount to increment by (negative to decrement).
 * @param label - Label used in error messages to identify the caller context.
 */
const incUser = async (
  filter: PlatformFilter,
  field: NumericUserField,
  amount: number,
  label: string,
) => {
  try {
    const result = await UserModel.updateOne(filter, {
      $inc: { [field]: amount },
    });

    if (result.modifiedCount === 0) {
      log({
        type: LogCode.Error,
        description: `Increment ${label}: No user found with filter: ${JSON.stringify(filter)}`,
      });
    }
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
  }
};

/**
 * Set fields on a user document by platform filter.
 *
 * @param filter - MongoDB filter targeting a user by discord_id or twitch_id.
 * @param payload - Fields to set on the user document.
 * @returns Updated user document, or null on error.
 */
const setUser = async (
  filter: PlatformFilter,
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndUpdate(
      filter,
      { $set: payload },
      { returnDocument: 'after' },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/**
 * Create a new user document.
 *
 * @param payload - User fields to save.
 * @returns The created user document, or null on error.
 */
export const createUser = async (
  payload: Partial<User>,
): Promise<UserDocument | null> => {
  try {
    const user = new UserModel(payload);
    return user.save();
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/**
 * Delete a user document by filter.
 *
 * @param filter - Fields to match the user document against.
 * @returns The deleted user document, or null if not found or on error.
 */
const deleteUserBy = async (filter: Partial<User>): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndDelete(filter);
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/** Delete a user document by internal user ID. */
export const deleteUser = (id: string) => deleteUserBy({ user_id: id });

/** Delete a user document by Discord user ID. */
export const deleteUserByDiscordId = (id: string) => deleteUserBy({ discord_id: id });

/** Delete a user document by Twitch username. */
export const deleteUserByTwitchUsername = (username: string) => deleteUserBy({ twitch_username: username });

/**
 * Find or create a user document for a Discord user.
 *
 * @param discordUser - Discord.js User object from the interaction.
 * @returns The existing or newly created user document, or null on error.
 */
export const findOrCreateDiscordUser = async (
  discordUser: DiscordUser,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndUpdate(
      { discord_id: discordUser.id },
      {
        $setOnInsert: {
          user_id: uuidv4(),
          discord_id: discordUser.id,
          discord_username: discordUser.username,
          discord_name: discordUser.displayName,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/**
 * Find or create a user document for a Twitch chatter.
 *
 * @param userstate - TMI.js userstate object containing user-id and username.
 * @returns The existing or newly created user document, or null on error.
 */
export const findOrCreateTwitchUser = async (
  userstate: ObjectProps,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndUpdate(
      { twitch_id: userstate['user-id'] },
      {
        $setOnInsert: {
          user_id: uuidv4(),
          twitch_id: userstate['user-id'],
          twitch_username: userstate.username,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/**
 * Find a user document by filter.
 *
 * @param filter - Fields to match the user document against.
 * @returns The matching user document, or null if not found or on error.
 */
const findUserBy = async (filter: Partial<User>): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOne(filter);
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/** Find a user document by Twitch username. */
export const getTwitchUserByName = (username: string) =>
  findUserBy({ twitch_username: username.toLowerCase() });

/** Find a user document by internal user ID. */
export const getUserById = (id: string) => findUserBy({ user_id: id });

/**
 * Get a ranked leaderboard of Discord users sorted by the given field. Excludes Twitch-only accounts.
 *
 * @param category - The user field to rank by.
 * @param max - Maximum number of results to return.
 * @returns Array of user documents sorted descending by the category field.
 */
export const getDiscordLeaderboard = async (
  category: NumericUserField,
  max: number,
): Promise<UserDocument[]> => {
  try {
    return await UserModel.find({
      discord_id: { $exists: true, $ne: null },
      [category]: { $gt: 0 },
    })
      .sort([[category, -1]])
      .limit(max);
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return [];
  }
};

/**
 * Get the rank of a Discord user by cash value. Excludes Twitch-only accounts.
 *
 * @param value - The user's current cash value.
 * @returns 1-based rank position, or null on error.
 */
export const getDiscordUserRank = async (
  value: number,
): Promise<number | null> => {
  try {
    const rank = await UserModel.countDocuments({
      discord_id: { $exists: true, $ne: null },
      cash: { $gt: value },
    });
    return rank + 1;
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/**
 * Increment a field on a Discord user document.
 *
 * @param id - Discord user ID.
 * @param field - The numeric field to increment.
 * @param amount - The amount to increment by (negative to decrement).
 */
export const incDiscordUser = async (
  id: string,
  field: NumericUserField,
  amount: number,
) => incUser({ discord_id: id }, field, amount, 'Discord User');

/**
 * Increment a field on a Twitch user document.
 *
 * @param id - Twitch user ID.
 * @param field - The numeric field to increment.
 * @param amount - The amount to increment by (negative to decrement).
 */
export const incTwitchUser = async (
  id: string,
  field: NumericUserField,
  amount: number,
) => incUser({ twitch_id: id }, field, amount, 'Twitch User');

/**
 * Set fields on a Discord user document.
 *
 * @param id - Discord user ID.
 * @param payload - Fields to set on the user document.
 * @returns Updated user document, or null on error.
 */
export const setDiscordUser = async (
  id: string,
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => setUser({ discord_id: id }, payload);

/**
 * Set fields on a Twitch user document.
 *
 * @param id - Twitch user ID.
 * @param payload - Fields to set on the user document.
 * @returns Updated user document, or null on error.
 */
export const setTwitchUser = async (
  id: string,
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => setUser({ twitch_id: id }, payload);
