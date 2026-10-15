import { DatePipe, DecimalPipe, LowerCasePipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { SeasonalBacktest } from '../../models/seasonal-backtest';
import { SeasonalMetric } from '../../models/seasonal-metric';
import { MetricDiffPipe } from '../../pipes/metric-diff.pipe';
import { MetricValuePipe } from '../../pipes/metric-value.pipe';
import { SeasonalMetricLabelPipe } from '../../pipes/seasonal-metric-label.pipe';
import { parseMonth } from '../../utils/parse-month';
import { SEASONAL_METRIC_KEYS, SEASONAL_METRIC_TONES } from '../../utils/seasonal-metric-maps';

@Component({
  selector: 'app-backtest-tab',
  imports: [
    DatePipe,
    DecimalPipe,
    LowerCasePipe,
    PercentPipe,
    MetricDiffPipe,
    MetricValuePipe,
    SeasonalMetricLabelPipe,
  ],
  templateUrl: './backtest-tab.html',
  styleUrl: './backtest-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BacktestTab {
  /** null = nothing to show (load failed). */
  readonly data = input.required<SeasonalBacktest | null>();
  readonly loading = input.required<boolean>();

  protected readonly SeasonalMetric = SeasonalMetric;
  protected readonly metrics = Object.values(SeasonalMetric);
  protected readonly metric = signal(SeasonalMetric.Total);
  protected readonly tone = computed(() => SEASONAL_METRIC_TONES[this.metric()]);
  private readonly key = computed(() => SEASONAL_METRIC_KEYS[this.metric()]);

  protected readonly range = computed(() => {
    const data = this.data();
    if (!data) return null;
    const { latest } = data;
    return {
      dataFrom: parseMonth(data.dataFrom),
      dataThrough: parseMonth(data.dataThrough),
      testFrom: parseMonth(latest.testFrom),
      testTo: parseMonth(latest.testTo),
      trainedFrom: parseMonth(latest.trainedFrom),
      trainedThrough: parseMonth(latest.trainedThrough),
    };
  });

  protected readonly scores = computed(() => this.data()?.[this.key()] ?? null);

  protected readonly skills = computed(() => {
    const scores = this.scores();
    if (!scores) return [];
    return [
      { label: 'same month last year', value: scores.skillVsLastYear },
      { label: 'trailing average', value: scores.skillVsTrailing },
    ].flatMap(({ label, value }) => (value != null ? [{ label, value }] : []));
  });

  protected readonly rows = computed(() => {
    const key = this.key();
    const isRate = this.metric() === SeasonalMetric.OnTimeRate;
    const months = (this.data()?.latest.months ?? []).map((item) => ({
      month: parseMonth(item.month),
      point: item[key] ?? null,
    }));

    const values = months.flatMap(({ point }) =>
      point ? [point.low, point.high, point.actual, point.expected] : [],
    );
    let min = isRate && values.length ? Math.min(...values) : 0;
    let max = Math.max(0, ...values);
    // Rates sit in a narrow band, so zoom in on it instead of starting at 0.
    const pad = (max - min) * 0.1;
    if (isRate) {
      min = Math.max(0, min - pad);
    }
    max += pad;
    const scale = (value: number) => (max > min ? ((value - min) / (max - min)) * 100 : 50);

    return months.map(({ month, point }) => ({
      month,
      point,
      error: point ? point.actual - point.expected : null,
      above: point ? !point.inRange && point.actual > point.high : false,
      low: point ? scale(point.low) : 0,
      high: point ? scale(point.high) : 0,
      expected: point ? scale(point.expected) : 0,
      actual: point ? scale(point.actual) : 0,
    }));
  });
}
