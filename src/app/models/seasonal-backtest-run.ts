import { SeasonalBacktestMonth } from './seasonal-backtest-month';

export interface SeasonalBacktestRun {
  /** yyyy-MM */
  testFrom: string;
  testTo: string;
  /** History the test forecast was built from, yyyy-MM. */
  trainedFrom: string;
  trainedThrough: string;
  years: number;
  months: SeasonalBacktestMonth[];
}
