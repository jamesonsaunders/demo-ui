import { formatNumber, formatPercent } from '@angular/common';
import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

/** Seasonal index vs. a typical month: rates as a difference in points, counts as a % change. */
@Pipe({ name: 'seasonalIndex' })
export class SeasonalIndexPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: number | null | undefined, isRate: boolean): string {
    if (value == null) return '';
    const sign = value > 0 ? '+' : '';
    return isRate
      ? `${sign}${formatNumber(value * 100, this.locale, '1.1-1')} pts`
      : `${sign}${formatPercent(value, this.locale, '1.0-0')}`;
  }
}
