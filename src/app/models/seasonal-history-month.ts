export interface SeasonalHistoryMonth {
  /** yyyy-MM-dd */
  periodStart: string;
  deliveriesPromised: number;
  onTime: number;
  late: number;
  /** 0-1 */
  onTimeRate: number | null;
  /** false = partial/missing data, excluded from the stats. */
  complete: boolean;
}
