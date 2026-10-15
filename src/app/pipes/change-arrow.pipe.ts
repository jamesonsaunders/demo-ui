import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'changeArrow' })
export class ChangeArrowPipe implements PipeTransform {
  transform(change: number): string {
    return change > 0 ? '▲' : change < 0 ? '▼' : '';
  }
}
