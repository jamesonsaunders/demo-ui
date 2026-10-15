import { BranchTrend } from './branch-trend';
import { ReasonTrend } from './reason-trend';
import { TrendBaseline } from './trend-baseline';
import { TrendMover } from './trend-mover';

export interface DeliveryTrends {
  /** yyyy-MM, the last N complete months, oldest first. The latest month is compared. */
  months: string[];
  compareTo: TrendBaseline;
  /** Branches with fewer deliveries than this in the latest month are `lowVolume`. */
  minDeliveries: number;
  /** Most notable first. Low-volume branches are left out. */
  movers: TrendMover[];
  /** Every branch (not filtered by branch), biggest increase first. */
  branches: BranchTrend[];
  /** Filtered by branch, biggest increase first. */
  reasons: ReasonTrend[];
}
