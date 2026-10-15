import { BacktestAheadScores } from './backtest-ahead-scores';
import { BacktestStats } from './backtest-stats';
import { ForecastVerdict } from './forecast-verdict';

/** Pooled over all tests and 1-12 months ahead. */
export interface BacktestScores extends BacktestStats {
  verdict: ForecastVerdict;
  /** 12 entries, first = 1 month ahead. */
  byAhead: BacktestAheadScores[];
}
