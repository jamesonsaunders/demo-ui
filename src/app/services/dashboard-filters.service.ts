import { formatDate } from '@angular/common';
import { Injectable, LOCALE_ID, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map, merge } from 'rxjs';

import { AppliedFilters } from '../models/applied-filters';
import { DashboardTab } from '../models/dashboard-tab';
import { DateRangePreset } from '../models/date-range-preset';
import { TrendBaseline } from '../models/trend-baseline';
import { getPresetRange, matchPreset } from '../utils/date-range-presets';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Dashboard filter form (synced with the URL query params) and the active tab (from the path). */
@Injectable()
export class DashboardFiltersService {
  private readonly locale = inject(LOCALE_ID);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly tabs = Object.values(DashboardTab);
  readonly datePresets = Object.values(DateRangePreset);
  readonly trendBaselines = Object.values(TrendBaseline);

  private readonly tabParam = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('tab'))),
  );
  readonly activeTab = computed(() => {
    const tab = this.tabParam() as DashboardTab;
    return this.tabs.includes(tab) ? tab : DashboardTab.Seasonal;
  });

  private readonly defaultRange = getPresetRange(DateRangePreset.Last12Months, this.locale) ?? {
    start: '',
    end: '',
  };

  readonly form = new FormGroup({
    datePreset: new FormControl(DateRangePreset.Last12Months, { nonNullable: true }),
    start: new FormControl(this.defaultRange.start, { nonNullable: true }),
    end: new FormControl(this.defaultRange.end, { nonNullable: true }),
    branch: new FormControl('', { nonNullable: true }),
    /** yyyy-MM-dd; '' or today = latest complete month. */
    trendsEnd: new FormControl(this.today(), { nonNullable: true }),
    trendsCompareTo: new FormControl(TrendBaseline.PreviousMonth, { nonNullable: true }),
  });

  constructor() {
    const { datePreset, start, end } = this.form.controls;

    datePreset.valueChanges.pipe(takeUntilDestroyed()).subscribe((preset) => {
      const range = getPresetRange(preset, this.locale);
      if (range) {
        this.form.patchValue(range, { emitEvent: false });
      }
    });

    merge(start.valueChanges, end.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const preset = matchPreset({ start: start.value, end: end.value }, this.locale);
        datePreset.setValue(preset, { emitEvent: false });
      });

    this.restore(this.route.snapshot.queryParamMap);
  }

  /** Writes the form to the URL and returns the filters to load with. */
  apply(): AppliedFilters {
    const { datePreset, start, end, branch, trendsEnd, trendsCompareTo } = this.form.getRawValue();
    const isCustom = datePreset === DateRangePreset.Custom;
    const trendsEndParam = trendsEnd === this.today() ? '' : trendsEnd;

    // Presets are saved by name so relative ranges stay relative on reload.
    void this.router.navigate([], {
      queryParams: {
        range: datePreset,
        start: (isCustom && start) || null,
        end: (isCustom && end) || null,
        branch: branch || null,
        trendsEnd: trendsEndParam || null,
        compareTo: trendsCompareTo,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    return {
      delayReasons: {
        start: start || undefined,
        end: end || undefined,
        branch: branch || undefined,
      },
      branch,
      trendsCompareTo,
      trendsEnd: trendsEndParam,
    };
  }

  selectTab(tab: DashboardTab): void {
    void this.router.navigate(['/', tab], {
      queryParamsHandling: 'preserve',
      replaceUrl: true,
    });
  }

  private restore(params: ParamMap): void {
    const { datePreset, start, end, branch, trendsEnd, trendsCompareTo } = this.form.controls;

    const range = params.get('range') as DateRangePreset;
    if (this.datePresets.includes(range) && range !== DateRangePreset.Custom) {
      datePreset.setValue(range);
    } else if (params.has('start') || params.has('end')) {
      start.setValue(this.dateParam(params, 'start'));
      end.setValue(this.dateParam(params, 'end'));
    }

    branch.setValue(params.get('branch') ?? '');

    if (params.has('trendsEnd')) {
      trendsEnd.setValue(this.dateParam(params, 'trendsEnd'));
    }

    const compareTo = params.get('compareTo') as TrendBaseline;
    if (this.trendBaselines.includes(compareTo)) {
      trendsCompareTo.setValue(compareTo);
    }
  }

  private dateParam(params: ParamMap, name: string): string {
    const value = params.get(name) ?? '';
    return DATE_PATTERN.test(value) ? value : '';
  }

  private today(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', this.locale);
  }
}
