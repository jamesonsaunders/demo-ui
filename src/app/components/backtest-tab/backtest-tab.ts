import { DatePipe, DecimalPipe, LowerCasePipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { RangeSource } from '../../models/range-source';
import { SeasonalBacktest } from '../../models/seasonal-backtest';
import { SeasonalMetric } from '../../models/seasonal-metric';
import { ForecastVerdictHintPipe } from '../../pipes/forecast-verdict-hint.pipe';
import { ForecastVerdictLabelPipe } from '../../pipes/forecast-verdict-label.pipe';
import { MetricDiffPipe } from '../../pipes/metric-diff.pipe';
import { MetricValuePipe } from '../../pipes/metric-value.pipe';
import { RangeSourceLabelPipe } from '../../pipes/range-source-label.pipe';
import { RecentWeightLabelPipe } from '../../pipes/recent-weight-label.pipe';
import { SeasonalMetricLabelPipe } from '../../pipes/seasonal-metric-label.pipe';
import { FORECAST_VERDICT_TONES } from '../../utils/forecast-verdict-tones';
import { parseMonth } from '../../utils/parse-month';
import { SEASONAL_METRIC_KEYS, SEASONAL_METRIC_TONES } from '../../utils/seasonal-metric-maps';

@Component({
  selector: 'app-backtest-tab',
  imports: [
    DatePipe,
    DecimalPipe,
    LowerCasePipe,
    PercentPipe,
    ForecastVerdictHintPipe,
    ForecastVerdictLabelPipe,
    MetricDiffPipe,
    MetricValuePipe,
    RangeSourceLabelPipe,
    RecentWeightLabelPipe,
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
  protected readonly RangeSource = RangeSource;
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
  protected readonly verdictTone = computed(() => {
    const scores = this.scores();
    return scores ? FORECAST_VERDICT_TONES[scores.verdict] : '';
  });

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
      point
        ? [point.low, point.high, point.actual, point.expected].filter(
            (value): value is number => value !== null,
          )
        : [],
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
      // Same sign as bias: + = forecast ran high.
      error: point ? point.expected - point.actual : null,
      above: point?.high != null && point.inRange === false && point.actual > point.high,
      low: point?.low != null ? scale(point.low) : 0,
      high: point?.high != null ? scale(point.high) : 0,
      expected: point ? scale(point.expected) : 0,
      actual: point ? scale(point.actual) : 0,
    }));
  });

  protected readonly hasRoughRange = computed(() =>
    this.rows().some(({ point }) => point?.rangeFrom === RangeSource.PastYears),
  );
}
