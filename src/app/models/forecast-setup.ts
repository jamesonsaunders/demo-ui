/** Forecast setup that tested best in the backtest. */
export interface ForecastSetup {
  years: number;
  /** Extra weight on recent history: 0-1. */
  recentWeight: number;
  workingDays: boolean;
}
