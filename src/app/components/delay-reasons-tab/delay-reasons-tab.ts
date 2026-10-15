import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DelayReasonCount } from '../../models/delay-reason-count';

@Component({
  selector: 'app-delay-reasons-tab',
  imports: [DecimalPipe, PercentPipe],
  templateUrl: './delay-reasons-tab.html',
  styleUrl: './delay-reasons-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelayReasonsTab {
  readonly data = input.required<DelayReasonCount[]>();
  readonly loading = input.required<boolean>();

  protected readonly total = computed(() => this.data().reduce((sum, row) => sum + row.count, 0));
  protected readonly maxCount = computed(() => Math.max(0, ...this.data().map((row) => row.count)));
}
