import { User as DiscordUser, Guild } from 'discord.js';

import { UserDocument, UserModel } from '@parthenonlab/models';
import { User } from '@parthenonlab/types';

import { CONFIG } from '@/constants';
import { log } from '@/discord/helpers/log';
import { LogCode } from '@/enums/logs';
import { formatError } from '@/lib/utils';

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
 * @returns Updated user document, or null if not found or on error.
 */
const incUser = async (
  filter: PlatformFilter,
  field: NumericUserField,
  amount: number,
  label: string,
): Promise<UserDocument | null> => {
  try {
    const user = await UserModel.findOneAndUpdate(
      filter,
      { $inc: { [field]: amount } },
      { returnDocument: 'after' },
    );

    if (!user) {
      log({
        type: LogCode.Error,
        description: `Increment ${label}: No user found with filter: ${JSON.stringify(filter)}`,
      });
    }

    return user;
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
    return null;
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
  payload: Partial<User>,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndUpdate(
      filter,
      { $set: payload },
      { returnDocument: 'after' },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
    return null;
  }
};

/**
 * Delete a user document by filter.
 *
 * @param filter - Fields to match the user document against.
 * @returns The deleted user document, or null if not found or on error.
 */
const deleteUserBy = async (
  filter: Partial<User>,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndDelete(filter);
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
    return null;
  }
};

/** Delete a user document by internal user ID. */
export const deleteUser = (id: string) => deleteUserBy({ user_id: id });

/** Delete a user document by Discord user ID. */
export const deleteDiscordUser = (id: string) =>
  deleteUserBy({ discord_id: id });

/** Delete a user document by Twitch username. */
export const deleteTwitchUserByName = (username: string) =>
  deleteUserBy({ twitch_username: username });

/**
 * Find a user document by platform filter, creating it if it doesn't exist.
 *
 * @param filter - MongoDB filter targeting a user by discord_id or twitch_id.
 * @param fields - Additional fields to set only when the user is created.
 * @returns The existing or newly created user document, or null on error.
 */
const findOrCreateUser = async (
  filter: PlatformFilter,
  fields: Partial<User>,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndUpdate(
      filter,
      {
        $setOnInsert: {
          user_id: crypto.randomUUID(),
          ...filter,
          ...fields,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
    return null;
  }
};

/**
 * Find or create a user document for a Discord user.
 *
 * @param discordUser - Discord.js User object from the interaction.
 * @returns The existing or newly created user document, or null on error.
 */
export const findOrCreateDiscordUser = (discordUser: DiscordUser) =>
  findOrCreateUser(
    { discord_id: discordUser.id },
    {
      discord_username: discordUser.username,
      discord_name: discordUser.displayName,
    },
  );

/**
 * Find or create a user document for a Twitch chatter.
 *
 * @param id - Twitch user ID.
 * @param username - Twitch login name.
 * @returns The existing or newly created user document, or null on error.
 */
export const findOrCreateTwitchUser = (id: string, username: string) =>
  findOrCreateUser({ twitch_id: id }, { twitch_username: username });

/**
 * Find a user document by filter.
 *
 * @param filter - Fields to match the user document against.
 * @returns The matching user document, or null if not found or on error.
 */
const getUserBy = async (
  filter: Partial<User>,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOne(filter);
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
    return null;
  }
};

/** Find a user document by Twitch username. */
export const getTwitchUserByName = (username: string) =>
  getUserBy({ twitch_username: username.toLowerCase() });

/** Find a user document by internal user ID. */
export const getUser = (id: string) => getUserBy({ user_id: id });

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
    log({ type: LogCode.Error, description: formatError(error) });
    return [];
  }
};

/**
 * Get the rank of a Discord user by the given field. Excludes Twitch-only accounts.
 *
 * @param category - The user field to rank by.
 * @param value - The user's current value for the category.
 * @returns 1-based rank position, or null on error.
 */
export const getDiscordUserRank = async (
  category: NumericUserField,
  value: number,
): Promise<number | null> => {
  try {
    const rank = await UserModel.countDocuments({
      discord_id: { $exists: true, $ne: null },
      [category]: { $gt: value },
    });
    return rank + 1;
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
    return null;
  }
};

/**
 * Increment a field on a Discord user document.
 *
 * @param id - Discord user ID.
 * @param field - The numeric field to increment.
 * @param amount - The amount to increment by (negative to decrement).
 * @returns Updated user document, or null if not found or on error.
 */
export const incDiscordUser = async (
  id: string,
  field: NumericUserField,
  amount: number,
): Promise<UserDocument | null> => incUser({ discord_id: id }, field, amount, 'Discord User');

/**
 * Increment a field on a Twitch user document.
 *
 * @param id - Twitch user ID.
 * @param field - The numeric field to increment.
 * @param amount - The amount to increment by (negative to decrement).
 * @returns Updated user document, or null if not found or on error.
 */
export const incTwitchUser = async (
  id: string,
  field: NumericUserField,
  amount: number,
): Promise<UserDocument | null> => incUser({ twitch_id: id }, field, amount, 'Twitch User');

/**
 * Set fields on a Discord user document.
 *
 * @param id - Discord user ID.
 * @param payload - Fields to set on the user document.
 * @returns Updated user document, or null on error.
 */
export const setDiscordUser = async (
  id: string,
  payload: Partial<User>,
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
  payload: Partial<User>,
): Promise<UserDocument | null> => setUser({ twitch_id: id }, payload);

/**
 * Sets the subscriber field for members based on Twitch and Discord subscriber roles.
 *
 * @param guild - Guild object for the server.
 */
export const syncDiscordSubscribers = async (guild: Guild) => {
  const roleIds = [
    CONFIG.ROLES.SUBSCRIBER.DISCORD,
    CONFIG.ROLES.SUBSCRIBER.TWITCH,
  ];

  try {
    const members = await guild.members.fetch();

    const operations = members.map(member => {
      const isSubscriber = roleIds.some(roleId =>
        member.roles.cache.has(roleId),
      );

      return {
        updateOne: {
          filter: { discord_id: member.id },
          update: {
            $set: { subscriber: isSubscriber },
            $setOnInsert: {
              user_id: crypto.randomUUID(),
              discord_id: member.id,
              discord_username: member.user.username,
              discord_name: member.displayName,
            },
          },
          upsert: true,
        },
      };
    });

    await UserModel.bulkWrite(operations);
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
  }
};
