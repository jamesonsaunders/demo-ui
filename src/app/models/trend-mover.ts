export interface TrendMover {
  kind: 'branch' | 'reason';
  /** Branch or reason name. */
  name: string;
  /** Baseline value. Branch: late rate (0-1). Reason: delayed orders, always > 0. */
  from: number;
  /** Latest month value, same unit as `from`. */
  to: number;
}
