/** Parses yyyy-MM(-dd) without the timezone shift `new Date('yyyy-MM-dd')` causes. */
export function parseMonth(value: string): Date {
  return new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, 1);
}
