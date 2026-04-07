import { nanoid } from 'nanoid';

import { CatchDocument, CatchModel } from '@parthenonlab/models';

import { log } from '@/discord/helpers/log';
import { LogCode } from '@/enums/logs';

interface CreateCatchParams {
  discord_id: string;
  original_trainer: string;
  pokemon_id: number;
  gender: string | null;
  variant: string;
  shiny: boolean;
  ball_used: string;
}

/**
 * Count the number of Pokemon in a user's PC Box.
 *
 * @param discord_id - Discord user ID.
 * @returns The count of caught Pokemon, or 0 on error.
 */
export const getPCBoxCount = async (discord_id: string): Promise<number> => {
  try {
    return await CatchModel.countDocuments({ discord_id });
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return 0;
  }
};

/**
 * Save a caught Pokemon to the database.
 *
 * @param params - The catch data to save.
 * @returns The created catch document, or undefined on error.
 */
export const saveCatch = async (
  params: CreateCatchParams,
): Promise<CatchDocument | undefined> => {
  try {
    const pokemonCatch = new CatchModel({
      catch_id: `PKM-${nanoid(8)}`,
      caught_at: new Date(),
      ...params,
    });

    await pokemonCatch.save();

    return pokemonCatch;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return;
  }
};
