import { formatNumber, formatPercent } from '@angular/common';
import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

/** Rates (0-1) as a percent, counts as whole numbers. */
@Pipe({ name: 'metricValue' })
export class MetricValuePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: number | null | undefined, isRate: boolean): string {
    if (value == null) return '';
    return isRate
      ? formatPercent(value, this.locale, '1.0-1')
      : formatNumber(value, this.locale, '1.0-0');
  }
}
