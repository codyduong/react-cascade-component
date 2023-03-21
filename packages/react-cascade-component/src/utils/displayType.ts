export const displayType = (a: unknown): string =>
  a === null
    ? 'null'
    : Number.isNaN(a)
    ? 'NaN'
    : typeof a === 'object'
    ? `object: ${JSON.stringify(a)}`
    : typeof a;
