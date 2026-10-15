import { DatePipe, DecimalPipe, PercentPipe, formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  inject,
  input,
} from '@angular/core';

import { DeliveryTrends } from '../../models/delivery-trends';
import { TrendBaseline } from '../../models/trend-baseline';
import { ChangeArrowPipe } from '../../pipes/change-arrow.pipe';
import { TrendDirectionLabelPipe } from '../../pipes/trend-direction-label.pipe';
import { parseMonth } from '../../utils/parse-month';

@Component({
  selector: 'app-trends-tab',
  imports: [DatePipe, DecimalPipe, PercentPipe, ChangeArrowPipe, TrendDirectionLabelPipe],
  templateUrl: './trends-tab.html',
  styleUrl: './trends-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendsTab {
  private readonly locale = inject(LOCALE_ID);

  readonly data = input.required<DeliveryTrends | null>();
  readonly loading = input.required<boolean>();
  /** Branch the reasons are filtered by; '' = all branches. */
  readonly branch = input.required<string>();

  protected readonly months = computed(() => (this.data()?.months ?? []).map(parseMonth));
  protected readonly latest = computed(() => this.months().at(-1) ?? null);

  /** e.g. "vs Nov", "vs 3-month avg", "vs Dec 2024". */
  protected readonly baselineLabel = computed(() => {
    const data = this.data();
    const latest = this.latest();
    if (!data || !latest) return '';

    const year = latest.getFullYear();
    const month = latest.getMonth();
    switch (data.compareTo) {
      case TrendBaseline.PreviousMonth:
        return `vs ${formatDate(new Date(year, month - 1, 1), 'MMM', this.locale)}`;
      case TrendBaseline.Previous3Months:
        return 'vs 3-month avg';
      case TrendBaseline.SameMonthLastYear:
        return `vs ${formatDate(new Date(year - 1, month, 1), 'MMM y', this.locale)}`;
    }
  });

  protected readonly movers = computed(() =>
    (this.data()?.movers ?? []).map((mover) => ({
      ...mover,
      up: mover.to > mover.from,
      // Branch: rate difference (pts). Reason: relative change (%).
      size: Math.abs(
        mover.kind === 'branch' ? mover.to - mover.from : (mover.to - mover.from) / mover.from,
      ),
    })),
  );

  protected readonly lowVolumeBranches = computed(() =>
    (this.data()?.branches ?? [])
      .filter((row) => row.lowVolume)
      .map((row) => row.branch)
      .join(', '),
  );
}
