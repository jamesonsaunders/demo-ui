import { TrendDirection } from './trend-direction';

export interface ReasonTrend {
  reason: string;
  /** Delayed orders, one per entry in `months`. */
  counts: number[];
  /** Delayed orders the latest month is compared to; null = no data for the baseline. */
  baseline: number | null;
  /** Latest count - baseline. */
  change: number | null;
  /** change / baseline (0.45 = +45%); null when the baseline is 0 or missing. */
  changeRate: number | null;
  /** Share of all delays in the latest month, 0-1. */
  share: number;
  /** share - baseline share (0.11 = +11 pts). */
  shareChange: number | null;
  /** null = not enough data. */
  trend: TrendDirection | null;
}
