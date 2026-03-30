import { User } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

import { ObjectProps } from '@/interfaces/bot';
import { UserDocument, UserIncrementFields } from '@/interfaces/user';

import { UserModel } from '@/models/user';

export const createUser = async (
  payload: Partial<UserDocument>,
): Promise<UserDocument | undefined> => {
  try {
    const user = new UserModel(payload);
    return user.save();
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return;
  }
};

export const deleteUser = async (id: string): Promise<UserDocument | null> => {
  try {
    const deleted = await UserModel.findOneAndDelete({ user_id: id });
    return deleted;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};

export const deleteUserByDiscordId = async (
  id: string,
): Promise<UserDocument | null> => {
  try {
    const deleted = await UserModel.findOneAndDelete({ discord_id: id });
    return deleted;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};

export const deleteUserByTwitchUsername = async (
  username: string,
): Promise<UserDocument | null> => {
  try {
    const deleted = await UserModel.findOneAndDelete({
      twitch_username: username,
    });
    return deleted;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};

export const findOrCreateDiscordUser = async (
  discordUser: User,
): Promise<UserDocument | undefined> => {
  try {
    let user = await UserModel.findOne({ discord_id: discordUser.id }).exec();

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
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return;
  }
};

export const findOrCreateTwitchUser = async (
  userstate: ObjectProps,
): Promise<UserDocument | undefined> => {
  try {
    let user = await UserModel.findOne({
      twitch_id: userstate['user-id'],
    }).exec();

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
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return;
  }
};

export const getTwitchUserByName = async (
  username: string,
): Promise<UserDocument | null> => {
  try {
    const user = await UserModel.findOne({
      twitch_username: username.toLowerCase(),
    }).exec();
    return user;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};

export const getUserById = async (id: string): Promise<UserDocument | null> => {
  try {
    const user = await UserModel.findOne({
      user_id: id,
    }).exec();
    return user;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};

export const getUsersByCategory = async (
  category: string,
  max: number,
): Promise<UserDocument[]> => {
  try {
    const users = await UserModel.find({
      discord_id: { $exists: true, $ne: null },
      [category]: { $gt: 0 },
    })
      .sort({ [category]: -1 })
      .limit(max)
      .exec();

    return users;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return [];
  }
};

export const getUserRank = async (value: number): Promise<number | null> => {
  try {
    const rank = await UserModel.countDocuments({
      discord_id: { $exists: true, $ne: null },
      cash: { $gt: value },
    });
    return rank + 1;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};

export const incDiscordUser = async (
  id: string,
  values: UserIncrementFields,
) => {
  if (Object.keys(values).length === 0) {
    return console.error(
      '🦉 Error: No Fields Specified for Discord User Increment',
    );
  }

  try {
    const result = await UserModel.updateOne(
      { discord_id: id },
      { $inc: values },
    );

    if (result.modifiedCount === 0) {
      log({
        type: LogCode.Error,
        description: `Increment Discord User: No user found with Discord ID: ${id}`,
      });
    }
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
  }
};

export const incTwitchUser = async (
  id: string,
  values: UserIncrementFields,
) => {
  if (Object.keys(values).length === 0) {
    return console.error(
      '🦉 Error: No Fields Specified for Twitch User Increment',
    );
  }

  try {
    const result = await UserModel.updateOne(
      { twitch_id: id },
      { $inc: values },
    );

    if (result.modifiedCount === 0) {
      log({
        type: LogCode.Error,
        description: `Increment Twitch User: No user found with Discord ID: ${id}`,
      });
    }
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
  }
};

export const setDiscordUser = async (
  id: string,
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => {
  try {
    const user = await UserModel.findOneAndUpdate(
      { discord_id: id },
      { $set: { ...payload } },
      { new: true },
    );
    return user;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};

export const setTwitchUser = async (
  id: string,
  payload: Partial<UserDocument>,
): Promise<UserDocument | null> => {
  try {
    const user = await UserModel.findOneAndUpdate(
      { twitch_id: id },
      { $set: { ...payload } },
      { new: true },
    );
    return user;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};
