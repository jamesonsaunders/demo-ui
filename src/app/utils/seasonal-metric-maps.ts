import { SeasonalMetric } from '../models/seasonal-metric';
import { SeasonalMetricKey } from '../models/seasonal-metric-key';

/** Colour class for each metric's charts and KPIs. */
export const SEASONAL_METRIC_TONES: Record<SeasonalMetric, string> = {
  [SeasonalMetric.Total]: 'primary',
  [SeasonalMetric.OnTimeRate]: 'success',
  [SeasonalMetric.Late]: 'danger',
};

/** API field holding each metric's values. */
export const SEASONAL_METRIC_KEYS: Record<SeasonalMetric, SeasonalMetricKey> = {
  [SeasonalMetric.Total]: 'total',
  [SeasonalMetric.OnTimeRate]: 'onTimeRate',
  [SeasonalMetric.Late]: 'late',
};
