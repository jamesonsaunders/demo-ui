import { Route, Routes, UrlSegment } from '@angular/router';

import { DashboardTab } from './models/dashboard-tab';

const tabs: string[] = Object.values(DashboardTab);

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: DashboardTab.Seasonal },
  {
    // One route for every tab so the dashboard is reused, not recreated, when switching tabs.
    path: ':tab',
    canMatch: [(_route: Route, segments: UrlSegment[]) => tabs.includes(segments[0]?.path ?? '')],
    loadComponent: () =>
      import('./components/deliveries-dashboard/deliveries-dashboard').then(
        (m) => m.DeliveriesDashboard,
      ),
  },
  { path: '**', redirectTo: DashboardTab.Seasonal },
];
