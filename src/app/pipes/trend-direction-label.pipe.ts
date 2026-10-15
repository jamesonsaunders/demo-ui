import { Pipe, PipeTransform } from '@angular/core';

import { TrendDirection } from '../models/trend-direction';

const LABELS: Record<TrendDirection, string> = {
  [TrendDirection.Rising]: '▲ Rising',
  [TrendDirection.Falling]: '▼ Falling',
  [TrendDirection.Mixed]: 'Mixed',
};

@Pipe({ name: 'trendDirectionLabel' })
export class TrendDirectionLabelPipe implements PipeTransform {
  transform(value: TrendDirection): string {
    return LABELS[value] ?? value;
  }
}
