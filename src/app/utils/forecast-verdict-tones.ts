import { ForecastVerdict } from '../models/forecast-verdict';

/** Colour class for each verdict. */
export const FORECAST_VERDICT_TONES: Record<ForecastVerdict, string> = {
  [ForecastVerdict.Good]: 'success',
  [ForecastVerdict.Fair]: 'primary',
  [ForecastVerdict.Poor]: 'danger',
  [ForecastVerdict.Unknown]: '',
};
