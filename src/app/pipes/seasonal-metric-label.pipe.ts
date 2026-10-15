import { Pipe, PipeTransform } from '@angular/core';

import { SeasonalMetric } from '../models/seasonal-metric';

const LABELS: Record<SeasonalMetric, string> = {
  [SeasonalMetric.Total]: 'Total deliveries',
  [SeasonalMetric.OnTimeRate]: 'On-time rate',
  [SeasonalMetric.Late]: 'Late deliveries',
};

@Pipe({ name: 'seasonalMetricLabel' })
export class SeasonalMetricLabelPipe implements PipeTransform {
  transform(value: SeasonalMetric): string {
    return LABELS[value] ?? value;
  }
}
