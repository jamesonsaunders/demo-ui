import { formatNumber } from '@angular/common';
import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

/** Rate differences in points, count differences as whole numbers. */
@Pipe({ name: 'metricDiff' })
export class MetricDiffPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: number | null | undefined, isRate: boolean, signed = false): string {
    if (value == null) return '';
    const sign = signed && value > 0 ? '+' : '';
    return isRate
      ? `${sign}${formatNumber(value * 100, this.locale, '1.1-1')} pts`
      : `${sign}${formatNumber(value, this.locale, '1.0-0')}`;
  }
}
