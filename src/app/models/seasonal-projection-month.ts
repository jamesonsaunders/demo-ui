import { Projection } from './projection';
import { SeasonalMetricKey } from './seasonal-metric-key';

export interface SeasonalProjectionMonth extends Record<SeasonalMetricKey, Projection | null> {
  /** yyyy-MM */
  month: string;
}
