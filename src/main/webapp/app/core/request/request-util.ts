import { HttpParams } from '@angular/common/http';

/**
 * Converts a plain object of request parameters into Angular {@link HttpParams}.
 * Flattens array values so each element is appended as a separate query param.
 * Skips null/undefined values and empty strings.
 */
export const createRequestOption = (req?: any): HttpParams => {
  let options: HttpParams = new HttpParams();

  if (req) {
    for (const [key, val] of Object.entries(req)) {
      if (val !== undefined && val !== null) {
        for (const value of [req[key]].flat().filter(v => v !== '')) {
          options = options.append(key, value);
        }
      }
    }
  }

  return options;
};
