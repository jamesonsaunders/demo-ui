import { RangeSource } from './range-source';

/** expected ≈ level × (workingDayFactor ?? 1) × (1 + seasonalEffect). */
export interface Projection {
  expected: number;
  low: number;
  high: number;
  rangeFrom: RangeSource;
  /** Average month with the seasonal effect removed. */
  level: number;
  /** 0.08 = +8%. */
  seasonalEffect: number;
  /** vs. an average month (1.04 = 4% more); null = adjustment off. */
  workingDayFactor: number | null;
}
