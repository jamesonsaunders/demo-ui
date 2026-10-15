import { BacktestStats } from './backtest-stats';

export interface BacktestAheadScores extends BacktestStats {
  /** Months ahead, 1-12. */
  ahead: number;
}
