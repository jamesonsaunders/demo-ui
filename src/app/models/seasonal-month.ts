import { MonthStat } from './month-stat';
import { SeasonalMetricKey } from './seasonal-metric-key';

export interface SeasonalMonth extends Record<SeasonalMetricKey, MonthStat> {
  /** 1-12 */
  month: number;
  /** Years with complete data for this month. */
  years: number;
}
