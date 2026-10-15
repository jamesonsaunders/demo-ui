export interface BacktestStats {
  /** Forecasts scored. */
  months: number;
  /** Avg abs error (counts, or rate as 0-1). */
  mae: number | null;
  /** Abs error / actual total; null for on-time rate. */
  wape: number | null;
  /** + = over-predicts. */
  bias: number | null;
  /** Share of actuals inside the 80% range; null for on-time rate. */
  coverage: number | null;
  /** Forecasts behind coverage. */
  coverageMonths: number;
  /** > 0 = beats "same month last year". */
  skillVsLastYear: number | null;
  /** > 0 = beats a flat trailing average. */
  skillVsTrailing: number | null;
}
