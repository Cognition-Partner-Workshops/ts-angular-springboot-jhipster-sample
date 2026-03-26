/*
 * Function used to workaround https://github.com/microsoft/TypeScript/issues/16069
 * es2019 alternative `const filteredArr = myArr.flatMap((x) => x ? x : []);`
 */
export function isPresent<T>(t: T | undefined | null): t is T {
  return t !== undefined && t !== null;
}

/** Replaces NaN with 0 to safely use parsed numbers in templates and calculations. */
export const filterNaN = (input: number): number => (Number.isNaN(input) ? 0 : input);
