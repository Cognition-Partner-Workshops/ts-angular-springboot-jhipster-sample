import { Pipe, PipeTransform } from '@angular/core';

import dayjs from 'dayjs/esm';

@Pipe({
  name: 'formatMediumDate',
})
/** Pipe that formats a Day.js date as 'D MMM YYYY' (e.g. '5 Jan 2025'). */
export default class FormatMediumDatePipe implements PipeTransform {
  transform(day: dayjs.Dayjs | null | undefined): string {
    return day ? day.format('D MMM YYYY') : '';
  }
}
