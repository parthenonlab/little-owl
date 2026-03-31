import { User } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

import { ObjectProps } from '@/interfaces/bot';
import { UserDocument, UserIncrementFields } from '@/interfaces/user';

import { UserModel } from '@/models/user';

type PlatformFilter = { discord_id: string } | { twitch_id: string };

const incUser = async (
  filter: PlatformFilter,
  values: UserIncrementFields,
  label: string,
) => {
  if (Object.keys(values).length === 0) {
    return console.error('🦉 Error: No Fields Specified for User Increment');
  }

  try {
    const result = await UserModel.updateOne(filter, { $inc: values });

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

const setUser = async (
  filter: PlatformFilter,
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndUpdate(
      filter,
      { $set: { ...payload } },
      { returnDocument: 'after' },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const createUser = async (
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => {
  try {
    const user = new UserModel(payload);
    return user.save();
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const deleteUser = async (id: string): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndDelete({ user_id: id });
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const deleteUserByDiscordId = async (
  id: string,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndDelete({ discord_id: id });
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const deleteUserByTwitchUsername = async (
  username: string,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOneAndDelete({ twitch_username: username });
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const findOrCreateDiscordUser = async (
  discordUser: User,
): Promise<UserDocument | null> => {
  try {
    let user = await UserModel.findOne({ discord_id: discordUser.id });

    if (!user) {
      user = new UserModel({
        user_id: uuidv4(),
        discord_id: discordUser.id,
        discord_username: discordUser.username,
        discord_name: discordUser.displayName,
      });

      await user.save();
    }

    return user;
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const findOrCreateTwitchUser = async (
  userstate: ObjectProps,
): Promise<UserDocument | null> => {
  try {
    let user = await UserModel.findOne({
      twitch_id: userstate['user-id'],
    });

    if (!user) {
      user = new UserModel({
        user_id: uuidv4(),
        twitch_id: userstate['user-id'],
        twitch_username: userstate.username,
      });

      await user.save();
    }

    return user;
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const getTwitchUserByName = async (
  username: string,
): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOne({
      twitch_username: username.toLowerCase(),
    });
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const getUserById = async (id: string): Promise<UserDocument | null> => {
  try {
    return await UserModel.findOne({ user_id: id });
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

/** Returns ranked Discord users sorted by the given field. Excludes Twitch-only accounts. */
export const getDiscordLeaderboard = async (
  category: keyof UserIncrementFields,
  max: number,
): Promise<UserDocument[]> => {
  try {
    return await UserModel.find({
      discord_id: { $exists: true, $ne: null },
      [category]: { $gt: 0 },
    })
      .sort({ [category]: -1 })
      .limit(max);
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return [];
  }
};

/** Returns the rank of a Discord user by cash value. Excludes Twitch-only accounts. */
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

export const incDiscordUser = async (id: string, values: UserIncrementFields) =>
  incUser({ discord_id: id }, values, 'Discord User');

export const incTwitchUser = async (id: string, values: UserIncrementFields) =>
  incUser({ twitch_id: id }, values, 'Twitch User');

export const setDiscordUser = async (
  id: string,
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => setUser({ discord_id: id }, payload);

export const setTwitchUser = async (
  id: string,
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => setUser({ twitch_id: id }, payload);
