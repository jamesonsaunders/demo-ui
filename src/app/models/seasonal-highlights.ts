import { Season } from './season';

export interface SeasonalHighlights {
  /** 1-12 */
  highMonth: number | null;
  lowMonth: number | null;
  highSeason: Season | null;
  lowSeason: Season | null;
}
