import { Pipe, PipeTransform } from '@angular/core';

import { ForecastVerdict } from '../models/forecast-verdict';

const HINTS: Record<ForecastVerdict, string> = {
  [ForecastVerdict.Good]:
    'When tested on past months, it landed inside its range about as often as promised and had at least 10% less error than just repeating last year.',
  [ForecastVerdict.Fair]:
    'When tested on past months, it beat just repeating last year, but only slightly or its range was off. Use it as a rough guide.',
  [ForecastVerdict.Poor]:
    "When tested on past months, it was no better than just repeating last year, or its range missed too often. Don't rely on it.",
  [ForecastVerdict.Unknown]:
    "There aren't enough past months to test it yet (needs 24). Treat it as a rough guide.",
};

/** For metrics with no range (on-time rate), so the rating is based on error only. */
const NO_RANGE_HINTS: Record<ForecastVerdict, string> = {
  [ForecastVerdict.Good]:
    'When tested on past months, it had at least 10% less error than just repeating last year.',
  [ForecastVerdict.Fair]:
    'When tested on past months, it beat just repeating last year, but by less than 10%. Use it as a rough guide.',
  [ForecastVerdict.Poor]:
    "When tested on past months, it was no better than just repeating last year. Don't rely on it.",
  [ForecastVerdict.Unknown]: HINTS[ForecastVerdict.Unknown],
};

@Pipe({ name: 'forecastVerdictHint' })
export class ForecastVerdictHintPipe implements PipeTransform {
  transform(value: ForecastVerdict, hasRange = true): string {
    return (hasRange ? HINTS : NO_RANGE_HINTS)[value] ?? '';
  }
}
