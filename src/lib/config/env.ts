const ADMIN_SERVER_ID = process.env.ADMIN_SERVER_ID;

const MONGODB_ACTS = process.env.MONGODB_ACTS;
const MONGODB_INVENTORY = process.env.MONGODB_INVENTORY;
const MONGODB_STATS = process.env.MONGODB_STATS;
const MONGODB_USERS = process.env.MONGODB_USERS;

const SERVER_ID = process.env.SERVER_ID;

export const getENV = () => {
  if (
    !ADMIN_SERVER_ID ||
    !MONGODB_ACTS ||
    !MONGODB_INVENTORY ||
    !MONGODB_STATS ||
    !MONGODB_USERS ||
    !SERVER_ID
  ) {
    console.error('🦉 Error: Missing Necessary Environment Variables');
    process.exit(1);
  }

  return {
    ADMIN_SERVER_ID,
    MONGODB_ACTS,
    MONGODB_INVENTORY,
    MONGODB_STATS,
    MONGODB_USERS,
    SERVER_ID,
  };
};
