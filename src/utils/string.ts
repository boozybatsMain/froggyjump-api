export const stringify = (data: unknown): string => {
  return JSON.stringify(data, null, 2);
};
