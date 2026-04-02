const ADMIN_SERVER_ID = process.env.ADMIN_SERVER_ID;

const MONGODB_ACTS = process.env.MONGODB_ACTS;
const MONGODB_INVENTORY = process.env.MONGODB_INVENTORY;

const SERVER_ID = process.env.SERVER_ID;

/**
 * Return validated environment variables required at runtime.
 * Exits the process if any required variable is missing.
 *
 * @returns Object containing all required environment variable values.
 */
export const getENV = () => {
  if (!ADMIN_SERVER_ID || !MONGODB_ACTS || !MONGODB_INVENTORY || !SERVER_ID) {
    console.error('🦉 Error: Missing Necessary Environment Variables');
    process.exit(1);
  }

  return {
    ADMIN_SERVER_ID,
    MONGODB_ACTS,
    MONGODB_INVENTORY,
    SERVER_ID,
  };
};
