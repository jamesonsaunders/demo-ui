import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppliedFilters } from '../../models/applied-filters';
import { DashboardTab } from '../../models/dashboard-tab';
import { DelayReasonCount } from '../../models/delay-reason-count';
import { DeliveryFilters } from '../../models/delivery-filters';
import { DeliveryTrends } from '../../models/delivery-trends';
import { SeasonalBacktest } from '../../models/seasonal-backtest';
import { SeasonalPattern } from '../../models/seasonal-pattern';
import { TrendBaseline } from '../../models/trend-baseline';
import { DashboardTabLabelPipe } from '../../pipes/dashboard-tab-label.pipe';
import { DateRangePresetLabelPipe } from '../../pipes/date-range-preset-label.pipe';
import { TrendBaselineLabelPipe } from '../../pipes/trend-baseline-label.pipe';
import { ApiService } from '../../services/api.service';
import { DashboardFiltersService } from '../../services/dashboard-filters.service';
import { ToastService } from '../../services/toast.service';
import { getErrorMessage } from '../../utils/get-error-message';
import { BacktestTab } from '../backtest-tab/backtest-tab';
import { DelayReasonsTab } from '../delay-reasons-tab/delay-reasons-tab';
import { SeasonalTab } from '../seasonal-tab/seasonal-tab';
import { TrendsTab } from '../trends-tab/trends-tab';

const SEASONAL_YEARS = 3;
const SEASONAL_PROJECT_MONTHS = 6;
const TRENDS_MONTHS = 6;

@Component({
  selector: 'app-deliveries-dashboard',
  imports: [
    ReactiveFormsModule,
    DashboardTabLabelPipe,
    DateRangePresetLabelPipe,
    TrendBaselineLabelPipe,
    SeasonalTab,
    BacktestTab,
    DelayReasonsTab,
    TrendsTab,
  ],
  providers: [DashboardFiltersService],
  templateUrl: './deliveries-dashboard.html',
  styleUrl: './deliveries-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveriesDashboard implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly filterState = inject(DashboardFiltersService);

  protected readonly DashboardTab = DashboardTab;
  protected readonly filters = this.filterState.form;
  protected readonly activeTab = this.filterState.activeTab;

  protected readonly branches = signal<string[]>([]);
  protected readonly branchesLoading = signal(false);
  private readonly applied = signal<AppliedFilters | null>(null);
  /** Filters each tab's data was last loaded with. */
  private readonly loadedWith = new Map<DashboardTab, AppliedFilters>();
  /** Branch of the last Apply; '' = all branches. */
  protected readonly appliedBranch = computed(() => this.applied()?.branch ?? '');
  protected readonly delayReasons = signal<DelayReasonCount[]>([]);
  protected readonly seasonal = signal<SeasonalPattern | null>(null);
  protected readonly backtest = signal<SeasonalBacktest | null>(null);
  protected readonly trends = signal<DeliveryTrends | null>(null);
  protected readonly delayReasonsLoading = signal(false);
  protected readonly seasonalLoading = signal(false);
  protected readonly backtestLoading = signal(false);
  protected readonly trendsLoading = signal(false);
  protected readonly loading = computed(
    () =>
      this.delayReasonsLoading() ||
      this.seasonalLoading() ||
      this.backtestLoading() ||
      this.trendsLoading(),
  );

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      const applied = this.applied();
      if (applied && this.loadedWith.get(tab) !== applied) {
        this.loadedWith.set(tab, applied);
        untracked(() => this.loadTab(tab, applied));
      }
    });
  }

  ngOnInit(): void {
    void this.loadBranches();
    this.load();
  }

  protected load(): void {
    this.applied.set(this.filterState.apply());
  }

  private loadTab(tab: DashboardTab, applied: AppliedFilters): void {
    switch (tab) {
      case DashboardTab.Seasonal:
        void this.loadSeasonal(applied.branch);
        break;
      case DashboardTab.Backtest:
        void this.loadBacktest(applied.branch);
        break;
      case DashboardTab.DelayReasons:
        void this.loadDelayReasons(applied.delayReasons);
        break;
      case DashboardTab.Trends:
        void this.loadTrends(applied.branch, applied.trendsCompareTo, applied.trendsEnd);
        break;
    }
  }

  private async loadBranches(): Promise<void> {
    const branchControl = this.filters.controls.branch;
    this.branchesLoading.set(true);
    branchControl.disable();
    try {
      this.branches.set(await this.api.getBranches());
      this.branchesLoading.set(false);
      branchControl.enable();
    } catch (err) {
      this.branchesLoading.set(false);
      branchControl.enable();
      this.toast.error(getErrorMessage(err));
    }
  }

  private async loadDelayReasons(filters: DeliveryFilters): Promise<void> {
    this.delayReasonsLoading.set(true);
    try {
      this.delayReasons.set(await this.api.getDelayReasons(filters));
      this.delayReasonsLoading.set(false);
    } catch (err) {
      this.delayReasons.set([]);
      this.delayReasonsLoading.set(false);
      this.toast.error(getErrorMessage(err));
    }
  }

  private async loadTrends(branch: string, compareTo: TrendBaseline, end: string): Promise<void> {
    this.trendsLoading.set(true);
    try {
      this.trends.set(
        await this.api.getTrends(branch || undefined, TRENDS_MONTHS, compareTo, end || undefined),
      );
      this.trendsLoading.set(false);
    } catch (err) {
      this.trends.set(null);
      this.trendsLoading.set(false);
      this.toast.error(getErrorMessage(err));
    }
  }

  private async loadSeasonal(branch: string): Promise<void> {
    this.seasonalLoading.set(true);
    try {
      this.seasonal.set(
        await this.api.getSeasonal(branch || undefined, SEASONAL_YEARS, SEASONAL_PROJECT_MONTHS),
      );
      this.seasonalLoading.set(false);
    } catch (err) {
      this.seasonal.set(null);
      this.seasonalLoading.set(false);
      // 404 = no data for this branch; the tab shows its own empty state.
      if (!(err instanceof HttpErrorResponse && err.status === 404)) {
        this.toast.error(getErrorMessage(err));
      }
    }
  }

  private async loadBacktest(branch: string): Promise<void> {
    this.backtestLoading.set(true);
    try {
      this.backtest.set(await this.api.getSeasonalBacktest(branch || undefined));
      this.backtestLoading.set(false);
    } catch (err) {
      this.backtest.set(null);
      this.backtestLoading.set(false);
      this.toast.error(getErrorMessage(err));
    }
  }
}
