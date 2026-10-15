import { SeasonalHighlights } from './seasonal-highlights';
import { SeasonalHistoryMonth } from './seasonal-history-month';
import { SeasonalMetricKey } from './seasonal-metric-key';
import { SeasonalMonth } from './seasonal-month';
import { SeasonalProjectionMonth } from './seasonal-projection-month';

export interface SeasonalPattern {
  /** yyyy-MM */
  dataFrom: string;
  /** yyyy-MM, last complete month */
  dataThrough: string;
  /** Full years used for the stats; 0 = less than a year of data. */
  years: number;
  /** Every month from dataFrom to dataThrough, oldest first. */
  history: SeasonalHistoryMonth[];
  /** Always 12 entries, Jan-Dec. */
  months: SeasonalMonth[];
  highlights: Record<SeasonalMetricKey, SeasonalHighlights>;
  projection: SeasonalProjectionMonth[];
}
