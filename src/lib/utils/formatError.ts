const MAX_LENGTH = 4000;

/**
 * Formats an unknown error into a readable string for logging. Truncated to fit within a Discord embed description.
 *
 * @param error - The caught error value.
 * @returns The error stack or message for Error instances, or a JSON string otherwise.
 */
export const formatError = (error: unknown): string => {
  const text =
    error instanceof Error
      ? (error.stack ?? error.message)
      : JSON.stringify(error);

  return (text ?? String(error)).slice(0, MAX_LENGTH);
};
