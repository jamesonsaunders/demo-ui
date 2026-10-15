import { Pipe, PipeTransform } from '@angular/core';

import { DashboardTab } from '../models/dashboard-tab';

const LABELS: Record<DashboardTab, string> = {
  [DashboardTab.Seasonal]: 'Seasonal trends',
  [DashboardTab.Backtest]: 'Forecast accuracy',
  [DashboardTab.DelayReasons]: 'Delay reasons',
  [DashboardTab.Trends]: "What's changing",
};

@Pipe({ name: 'dashboardTabLabel' })
export class DashboardTabLabelPipe implements PipeTransform {
  transform(value: DashboardTab): string {
    return LABELS[value] ?? value;
  }
}
