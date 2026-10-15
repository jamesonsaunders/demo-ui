import { MetricMissing } from './metric-missing';
import { Projection } from './projection';
import { RateProjection } from './rate-projection';
import { SeasonalMetricKey } from './seasonal-metric-key';

export interface SeasonalProjectionMonth {
  /** yyyy-MM */
  month: string;
  total: Projection | null;
  late: Projection | null;
  onTimeRate: RateProjection | null;
  /** Why a metric is null; only keys whose metric is null. */
  missing: Partial<Record<SeasonalMetricKey, MetricMissing>>;
}
