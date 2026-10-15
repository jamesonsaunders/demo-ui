import { RangeSource } from './range-source';

export interface BacktestPoint {
  actual: number;
  expected: number;
  /** low/high/inRange/rangeFrom are null for on-time rate (no range). */
  low: number | null;
  high: number | null;
  /** actual within low..high */
  inRange: boolean | null;
  rangeFrom: RangeSource | null;
}
