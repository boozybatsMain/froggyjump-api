export const asyncMap = async <T, R>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < array.length; i++) {
    results.push(await callback(array[i], i, array));
  }

  return results;
};
