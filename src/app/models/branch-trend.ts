import { BranchTrendMonth } from './branch-trend-month';
import { TrendDirection } from './trend-direction';

export interface BranchTrend {
  branch: string;
  /** One per entry in `months`. */
  months: BranchTrendMonth[];
  /** Late rate the latest month is compared to; null = no data for the baseline. */
  baselineRate: number | null;
  /** Latest late rate - baselineRate (0.025 = +2.5 pts). */
  change: number | null;
  /** null = not enough data. */
  trend: TrendDirection | null;
  lowVolume: boolean;
}
