import { Pipe, PipeTransform } from '@angular/core';

import { MetricMissing } from '../models/metric-missing';

const LABELS: Record<MetricMissing, string> = {
  [MetricMissing.NoCompleteMonth]: 'No forecast: no complete history for this month',
  [MetricMissing.AllZero]: 'No forecast: always zero in recent history',
};

@Pipe({ name: 'metricMissingLabel' })
export class MetricMissingLabelPipe implements PipeTransform {
  transform(value: MetricMissing | undefined): string {
    return value ? (LABELS[value] ?? value) : 'No forecast';
  }
}
