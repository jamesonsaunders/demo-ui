export enum RangeSource {
  /** 80% range from past forecast misses. */
  PastMisses = 'pastMisses',
  /** Rough range from past years' spread; not an 80% range. */
  PastYears = 'pastYears',
}
