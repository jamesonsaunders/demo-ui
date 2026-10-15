import { Pipe, PipeTransform } from '@angular/core';

import { ForecastVerdict } from '../models/forecast-verdict';

const LABELS: Record<ForecastVerdict, string> = {
  [ForecastVerdict.Good]: 'Good',
  [ForecastVerdict.Fair]: 'Fair',
  [ForecastVerdict.Poor]: 'Poor',
  [ForecastVerdict.Unknown]: 'Not enough history to tell',
};

@Pipe({ name: 'forecastVerdictLabel' })
export class ForecastVerdictLabelPipe implements PipeTransform {
  transform(value: ForecastVerdict): string {
    return LABELS[value] ?? value;
  }
}
