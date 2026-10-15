import { Pipe, PipeTransform } from '@angular/core';

import { TrendBaseline } from '../models/trend-baseline';

const LABELS: Record<TrendBaseline, string> = {
  [TrendBaseline.PreviousMonth]: 'Previous month',
  [TrendBaseline.Previous3Months]: 'Average of previous 3 months',
  [TrendBaseline.SameMonthLastYear]: 'Same month last year',
};

@Pipe({ name: 'trendBaselineLabel' })
export class TrendBaselineLabelPipe implements PipeTransform {
  transform(value: TrendBaseline): string {
    return LABELS[value] ?? value;
  }
}
