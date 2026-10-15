import { Pipe, PipeTransform } from '@angular/core';

import { ProjectionMissing } from '../models/projection-missing';

const LABELS: Record<ProjectionMissing, string> = {
  [ProjectionMissing.TooLittleHistory]: 'No forecast yet: it needs at least 12 months of history.',
  [ProjectionMissing.NoRecentCompleteMonths]:
    'No forecast: there are no complete months in the last 12 to forecast from.',
};

@Pipe({ name: 'projectionMissingLabel' })
export class ProjectionMissingLabelPipe implements PipeTransform {
  transform(value: ProjectionMissing): string {
    return LABELS[value] ?? value;
  }
}
