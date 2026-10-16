import { DatePipe, DecimalPipe, LowerCasePipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { RangeSource } from '../../models/range-source';
import { SeasonalMetric } from '../../models/seasonal-metric';
import { Season } from '../../models/season';
import { SeasonalHistoryMonth } from '../../models/seasonal-history-month';
import { SeasonalPattern } from '../../models/seasonal-pattern';
import { ForecastVerdictHintPipe } from '../../pipes/forecast-verdict-hint.pipe';
import { ForecastVerdictLabelPipe } from '../../pipes/forecast-verdict-label.pipe';
import { MetricMissingLabelPipe } from '../../pipes/metric-missing-label.pipe';
import { MetricValuePipe } from '../../pipes/metric-value.pipe';
import { ProjectionMissingLabelPipe } from '../../pipes/projection-missing-label.pipe';
import { RangeSourceLabelPipe } from '../../pipes/range-source-label.pipe';
import { RecentWeightLabelPipe } from '../../pipes/recent-weight-label.pipe';
import { SeasonalIndexPipe } from '../../pipes/seasonal-index.pipe';
import { SeasonalMetricLabelPipe } from '../../pipes/seasonal-metric-label.pipe';
import { FORECAST_VERDICT_TONES } from '../../utils/forecast-verdict-tones';
import { parseMonth } from '../../utils/parse-month';
import { SEASONAL_METRIC_KEYS, SEASONAL_METRIC_TONES } from '../../utils/seasonal-metric-maps';

// Only used for month-name formatting; the year is irrelevant.
const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1));

function historyValue(metric: SeasonalMetric, row: SeasonalHistoryMonth): number | null {
  switch (metric) {
    case SeasonalMetric.Total:
      return row.deliveriesPromised;
    case SeasonalMetric.Late:
      return row.late;
    case SeasonalMetric.OnTimeRate:
      return row.onTimeRate;
  }
}

@Component({
  selector: 'app-seasonal-tab',
  imports: [
    DatePipe,
    DecimalPipe,
    LowerCasePipe,
    PercentPipe,
    ForecastVerdictHintPipe,
    ForecastVerdictLabelPipe,
    MetricMissingLabelPipe,
    MetricValuePipe,
    ProjectionMissingLabelPipe,
    RangeSourceLabelPipe,
    RecentWeightLabelPipe,
    SeasonalIndexPipe,
    SeasonalMetricLabelPipe,
  ],
  templateUrl: './seasonal-tab.html',
  styleUrl: './seasonal-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonalTab {
  /** null = no data for this branch. */
  readonly data = input.required<SeasonalPattern | null>();
  readonly loading = input.required<boolean>();
  readonly showAccuracy = output<void>();

  protected readonly SeasonalMetric = SeasonalMetric;
  protected readonly RangeSource = RangeSource;
  protected readonly metrics = Object.values(SeasonalMetric);
  protected readonly months = MONTHS;
  protected readonly metric = signal(SeasonalMetric.Total);
  protected readonly tone = computed(() => SEASONAL_METRIC_TONES[this.metric()]);
  private readonly key = computed(() => SEASONAL_METRIC_KEYS[this.metric()]);

  protected readonly strength = computed(() => this.data()?.seasonalStrength[this.key()] ?? null);
  protected readonly verdict = computed(() => this.data()?.forecastVerdict?.[this.key()] ?? null);
  protected readonly verdictTone = computed(() => {
    const verdict = this.verdict();
    return verdict ? FORECAST_VERDICT_TONES[verdict] : '';
  });
  protected readonly workingDays = computed(() => this.data()?.forecastSetup.workingDays ?? false);

  protected readonly range = computed(() => {
    const data = this.data();
    if (!data) return null;
    const historyFrom = data.history[0]?.periodStart ?? data.dataFrom;
    return {
      historyFrom: parseMonth(historyFrom),
      from: parseMonth(data.dataFrom),
      through: parseMonth(data.dataThrough),
    };
  });

  /** [year, rows indexed by month (0-11)], oldest year first. */
  private readonly byYear = computed(() => {
    const years = new Map<number, (SeasonalHistoryMonth | undefined)[]>();
    for (const row of this.data()?.history ?? []) {
      const year = Number(row.periodStart.slice(0, 4));
      const month = Number(row.periodStart.slice(5, 7)) - 1;
      let months = years.get(year);
      if (!months) {
        months = Array.from({ length: 12 }, () => undefined);
        years.set(year, months);
      }
      months[month] = row;
    }
    return [...years.entries()].sort(([a], [b]) => a - b);
  });

  protected readonly heatmap = computed(() => {
    const metric = this.metric();
    const rows = this.byYear().map(([year, months]) => ({
      year,
      cells: months.map((row) => ({
        value: row ? historyValue(metric, row) : null,
        complete: row?.complete ?? true,
      })),
    }));

    // Incomplete months are left out of the scale so a partial month doesn't wash out the rest.
    const all = rows.flatMap((row) =>
      row.cells.flatMap((cell) => (cell.complete && cell.value !== null ? [cell.value] : [])),
    );
    const min = Math.min(...all);
    const max = Math.max(...all);

    return rows.map(({ year, cells }) => ({
      year,
      cells: cells.map((cell) => ({
        ...cell,
        // Min-max scaled so narrow ranges (e.g. on-time rates of 90-97%) still show contrast.
        intensity:
          cell.value === null || !cell.complete
            ? 0
            : max > min
              ? (cell.value - min) / (max - min)
              : 1,
      })),
    }));
  });

  protected readonly averages = computed(() => {
    const key = this.key();
    const values = (this.data()?.months ?? []).map((item) => ({
      month: MONTHS[item.month - 1],
      value: item[key].average,
    }));

    const max = Math.max(0, ...values.map((item) => item.value ?? 0));
    return values.map((item) => ({
      ...item,
      height: max && item.value !== null ? (item.value / max) * 100 : 0,
    }));
  });

  protected readonly pattern = computed(() => {
    const key = this.key();
    const months = (this.data()?.months ?? []).map((item) => {
      const { index, yearsAbove, yearsBelow } = item[key];
      const agree = index ? (index > 0 ? yearsAbove : yearsBelow) : 0;
      return {
        month: MONTHS[item.month - 1],
        index,
        agree,
        years: item.years,
        agreeLabel: index
          ? `${index > 0 ? 'Above' : 'Below'} the trend in ${agree} of ${item.years} years`
          : '',
      };
    });

    const maxAbs = Math.max(0, ...months.map((item) => Math.abs(item.index ?? 0)));
    return months.map((item) => ({
      ...item,
      height: maxAbs && item.index ? (Math.abs(item.index) / maxAbs) * 100 : 0,
    }));
  });

  protected readonly highlights = computed(() => {
    const data = this.data();
    if (!data) return null;

    const { highMonth, lowMonth, highSeason, lowSeason } = data.highlights[this.key()];
    const pattern = this.pattern();
    const month = (value: number | null) =>
      value ? (pattern.find((item) => item.month === MONTHS[value - 1]) ?? null) : null;
    const season = (value: Season | null) =>
      value && {
        start: MONTHS[value.startMonth - 1],
        end: MONTHS[value.endMonth - 1],
        index: value.index,
      };

    return {
      high: month(highMonth),
      low: month(lowMonth),
      highSeason: season(highSeason),
      lowSeason: season(lowSeason),
    };
  });

  /** Complete history months by yyyy-MM. */
  private readonly historyByMonth = computed(
    () =>
      new Map(
        (this.data()?.history ?? []).flatMap((row) =>
          row.complete ? [[row.periodStart.slice(0, 7), row] as const] : [],
        ),
      ),
  );

  protected readonly projection = computed(() => {
    const key = this.key();
    const metric = this.metric();
    const history = this.historyByMonth();
    const items = (this.data()?.projection ?? []).map((item) => {
      const month = parseMonth(item.month);
      const lastYear = history.get(`${month.getFullYear() - 1}${item.month.slice(4, 7)}`);
      const point = key === 'onTimeRate' ? null : item[key];
      return {
        month,
        point,
        expected:
          key === 'onTimeRate' ? (item.onTimeRate?.expected ?? null) : (point?.expected ?? null),
        total: item.total?.expected ?? null,
        late: item.late?.expected ?? null,
        workingDays: point?.workingDayFactor != null ? point.workingDayFactor - 1 : null,
        missing: item.missing[key],
        lastYear: lastYear ? historyValue(metric, lastYear) : null,
      };
    });

    const max = Math.max(
      0,
      ...items.flatMap((item) => [item.point?.high ?? 0, item.expected ?? 0, item.lastYear ?? 0]),
    );
    const scale = (value: number | null) => (max && value !== null ? (value / max) * 100 : 0);
    return items.map((item) => ({
      ...item,
      height: scale(item.expected),
      low: scale(item.point?.low ?? null),
      high: scale(item.point?.high ?? null),
      lastYearAt: scale(item.lastYear),
    }));
  });

  protected readonly rangeSources = computed(
    () => new Set(this.projection().flatMap((item) => (item.point ? [item.point.rangeFrom] : []))),
  );
}
