import { DeliveryFilters } from './delivery-filters';
import { TrendBaseline } from './trend-baseline';

export interface AppliedFilters {
  delayReasons: DeliveryFilters;
  /** '' = all branches. */
  branch: string;
  trendsCompareTo: TrendBaseline;
  /** yyyy-MM-dd; '' = latest complete month. */
  trendsEnd: string;
}
