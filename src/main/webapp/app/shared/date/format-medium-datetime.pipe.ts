import { Pipe, PipeTransform } from '@angular/core';

import dayjs from 'dayjs/esm';

@Pipe({
  name: 'formatMediumDatetime',
})
/** Pipe that formats a Day.js date as 'D MMM YYYY HH:mm:ss' (e.g. '5 Jan 2025 14:30:00'). */
export default class FormatMediumDatetimePipe implements PipeTransform {
  transform(day: dayjs.Dayjs | null | undefined): string {
    return day ? day.format('D MMM YYYY HH:mm:ss') : '';
  }
}
