export interface BacktestPoint {
  actual: number;
  expected: number;
  low: number;
  high: number;
  /** actual within low..high */
  inRange: boolean;
}
