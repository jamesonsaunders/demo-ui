export interface BranchTrendMonth {
  deliveries: number;
  late: number;
  /** 0-1; null = no deliveries. */
  lateRate: number | null;
}
