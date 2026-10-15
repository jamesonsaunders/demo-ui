export interface MonthStat {
  average: number | null;
  /** Median across complete years. */
  typical: number | null;
  /** vs. a typical month. Counts: ratio - 1 (0.2 = +20%). On-time rate: difference (0.02 = +2 pts). */
  index: number | null;
  /** Years this month was above that year's average. */
  yearsAbove: number;
  yearsBelow: number;
}
