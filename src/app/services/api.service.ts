import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { DelayReasonCount } from '../models/delay-reason-count';
import { DeliveryFilters } from '../models/delivery-filters';
import { DeliveryTrends } from '../models/delivery-trends';
import { SeasonalBacktest } from '../models/seasonal-backtest';
import { SeasonalPattern } from '../models/seasonal-pattern';
import { TrendBaseline } from '../models/trend-baseline';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getBranches(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${this.baseUrl}/api/deliveries/branches`));
  }

  getDelayReasons(filters: DeliveryFilters): Promise<DelayReasonCount[]> {
    return firstValueFrom(
      this.http.get<DelayReasonCount[]>(`${this.baseUrl}/api/deliveries/delay-reasons`, {
        params: this.toParams({ ...filters }),
      }),
    );
  }

  /** `branch` only filters the reasons; branches are always all listed. */
  getTrends(
    branch: string | undefined,
    months: number,
    compareTo: TrendBaseline,
    /** yyyy-MM-dd; omit for the latest complete month. */
    end: string | undefined,
  ): Promise<DeliveryTrends> {
    return firstValueFrom(
      this.http.get<DeliveryTrends>(`${this.baseUrl}/api/deliveries/trends`, {
        params: this.toParams({ branch, months: String(months), compareTo, end }),
      }),
    );
  }

  /** 404 when the branch has no data (or only its go-live month). */
  getSeasonal(
    branch: string | undefined,
    years: number,
    projectMonths: number,
  ): Promise<SeasonalPattern> {
    return firstValueFrom(
      this.http.get<SeasonalPattern>(`${this.baseUrl}/api/deliveries/seasonal`, {
        params: this.toParams({
          branch,
          years: String(years),
          projectMonths: String(projectMonths),
        }),
      }),
    );
  }

  getSeasonalBacktest(branch: string | undefined): Promise<SeasonalBacktest> {
    return firstValueFrom(
      this.http.get<SeasonalBacktest>(`${this.baseUrl}/api/deliveries/seasonal/backtest`, {
        params: this.toParams({ branch }),
      }),
    );
  }

  private toParams(values: Record<string, string | undefined>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params = params.set(key, value);
      }
    }
    return params;
  }
}
