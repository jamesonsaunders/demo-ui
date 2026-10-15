import { BacktestScores } from './backtest-scores';
import { SeasonalBacktestRun } from './seasonal-backtest-run';
import { SeasonalMetricKey } from './seasonal-metric-key';

/** Scores are pooled over all tests and 1-12 months ahead. */
export interface SeasonalBacktest extends Record<SeasonalMetricKey, BacktestScores> {
  /** yyyy-MM */
  dataFrom: string;
  dataThrough: string;
  /** History length that tested best. */
  years: number;
  /** Extra weight on recent history that tested best: 0, 0.25, 0.5, 0.75 or 1. */
  recentWeight: number;
  /** Whether the working-day adjustment tested better. */
  workingDays: boolean;
  /** Number of test starting months. */
  tests: number;
  /** Most recent 12-month test. */
  latest: SeasonalBacktestRun;
}
