import { DatePipe, DecimalPipe, LowerCasePipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { SeasonalMetric } from '../../models/seasonal-metric';
import { Season } from '../../models/season';
import { SeasonalHistoryMonth } from '../../models/seasonal-history-month';
import { SeasonalPattern } from '../../models/seasonal-pattern';
import { SeasonalIndexPipe } from '../../pipes/seasonal-index.pipe';
import { SeasonalMetricLabelPipe } from '../../pipes/seasonal-metric-label.pipe';
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

  protected readonly SeasonalMetric = SeasonalMetric;
  protected readonly metrics = Object.values(SeasonalMetric);
  protected readonly months = MONTHS;
  protected readonly metric = signal(SeasonalMetric.Total);
  protected readonly tone = computed(() => SEASONAL_METRIC_TONES[this.metric()]);
  private readonly key = computed(() => SEASONAL_METRIC_KEYS[this.metric()]);

  protected readonly range = computed(() => {
    const data = this.data();
    return data && { from: parseMonth(data.dataFrom), through: parseMonth(data.dataThrough) };
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
          ? `${index > 0 ? 'Above' : 'Below'} that year's average in ${agree} of ${item.years} years`
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

  protected readonly projection = computed(() => {
    const key = this.key();
    const items = (this.data()?.projection ?? []).map((item) => ({
      month: parseMonth(item.month),
      value: item[key],
    }));

    const max = Math.max(0, ...items.map((item) => item.value?.high ?? 0));
    const scale = (value: number) => (max ? (value / max) * 100 : 0);
    return items.map(({ month, value }) => ({
      month,
      value,
      height: value ? scale(value.expected) : 0,
      low: value ? scale(value.low) : 0,
      high: value ? scale(value.high) : 0,
    }));
  });
}
