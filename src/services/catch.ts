import { nanoid } from 'nanoid';

import { log } from '@/discord/helpers/log';
import { LogCode } from '@/enums/logs';

import { CatchDocument } from '@/interfaces/catch';
import { CatchModel } from '@/models/catch';

interface CreateCatchParams {
  discord_id: string;
  pokemon_id: number;
  gender: string | null;
  variant: string;
  shiny: boolean;
  ball_used: string;
}

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
