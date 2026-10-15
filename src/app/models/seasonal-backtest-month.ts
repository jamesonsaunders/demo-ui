import { BacktestPoint } from './backtest-point';
import { SeasonalMetricKey } from './seasonal-metric-key';

/** Missing/null = no deliveries that month or no projection. */
export interface SeasonalBacktestMonth extends Partial<
  Record<SeasonalMetricKey, BacktestPoint | null>
> {
  /** yyyy-MM */
  month: string;
}
