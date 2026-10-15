export interface MonthStat {
  average: number | null;
  /** Median across complete years. */
  typical: number | null;
  /** Median gap from the trend line. Counts: 0.08 = +8%. On-time rate: difference (0.02 = +2 pts). */
  index: number | null;
  /** Years this month was above the trend line. */
  yearsAbove: number;
  yearsBelow: number;
}
