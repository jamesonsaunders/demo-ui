import { formatDate } from '@angular/common';

import { DateRange } from '../models/date-range';
import { DateRangePreset } from '../models/date-range-preset';

const FORMAT = 'yyyy-MM-dd';

// Clamps to the target month's last day (e.g. Mar 31 - 1 month = Feb 28/29).
function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
}

function toRange(start: Date | null, end: Date | null, locale: string): DateRange {
  return {
    start: start ? formatDate(start, FORMAT, locale) : '',
    end: end ? formatDate(end, FORMAT, locale) : '',
  };
}

/** Returns null for `Custom`, which has no fixed range. */
export function getPresetRange(
  preset: DateRangePreset,
  locale: string,
  today = new Date(),
): DateRange | null {
  const y = today.getFullYear();
  const m = today.getMonth();

  switch (preset) {
    case DateRangePreset.Last7Days:
      return toRange(new Date(y, m, today.getDate() - 6), today, locale);
    case DateRangePreset.LastMonth:
      return toRange(addMonths(today, -1), today, locale);
    case DateRangePreset.Last3Months:
      return toRange(addMonths(today, -3), today, locale);
    case DateRangePreset.Last12Months:
      return toRange(addMonths(today, -12), today, locale);
    case DateRangePreset.MonthToDate:
      return toRange(new Date(y, m, 1), today, locale);
    case DateRangePreset.YearToDate:
      return toRange(new Date(y, 0, 1), today, locale);
    case DateRangePreset.PreviousMonth:
      return toRange(new Date(y, m - 1, 1), new Date(y, m, 0), locale);
    case DateRangePreset.PreviousYear:
      return toRange(new Date(y - 1, 0, 1), new Date(y - 1, 11, 31), locale);
    case DateRangePreset.AllTime:
      return toRange(null, null, locale);
    case DateRangePreset.Custom:
      return null;
  }
}

export function matchPreset(range: DateRange, locale: string, today = new Date()): DateRangePreset {
  for (const preset of Object.values(DateRangePreset)) {
    const presetRange = getPresetRange(preset, locale, today);
    if (presetRange && presetRange.start === range.start && presetRange.end === range.end) {
      return preset;
    }
  }
  return DateRangePreset.Custom;
}
