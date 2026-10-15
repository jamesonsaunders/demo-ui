import { Pipe, PipeTransform } from '@angular/core';

import { DateRangePreset } from '../models/date-range-preset';

const LABELS: Record<DateRangePreset, string> = {
  [DateRangePreset.Last7Days]: 'Last 7 days',
  [DateRangePreset.LastMonth]: 'Last month',
  [DateRangePreset.Last3Months]: 'Last 3 months',
  [DateRangePreset.Last12Months]: 'Last 12 months',
  [DateRangePreset.MonthToDate]: 'Month to date',
  [DateRangePreset.YearToDate]: 'Year to date',
  [DateRangePreset.PreviousMonth]: 'Previous calendar month',
  [DateRangePreset.PreviousYear]: 'Previous calendar year',
  [DateRangePreset.AllTime]: 'All time',
  [DateRangePreset.Custom]: 'Custom',
};

@Pipe({ name: 'dateRangePresetLabel' })
export class DateRangePresetLabelPipe implements PipeTransform {
  transform(value: DateRangePreset): string {
    return LABELS[value] ?? value;
  }
}
