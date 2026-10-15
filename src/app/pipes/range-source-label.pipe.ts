import { Pipe, PipeTransform } from '@angular/core';

import { RangeSource } from '../models/range-source';

const LABELS: Record<RangeSource, string> = {
  [RangeSource.PastMisses]: '80% range',
  [RangeSource.PastYears]: 'Rough range',
};

@Pipe({ name: 'rangeSourceLabel' })
export class RangeSourceLabelPipe implements PipeTransform {
  transform(value: RangeSource): string {
    return LABELS[value] ?? value;
  }
}
