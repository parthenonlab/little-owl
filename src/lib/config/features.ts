export const isFeatureEnabled = (feature: string): boolean => {
  return process.env[`FEATURE_${feature}`] === 'true';
};
