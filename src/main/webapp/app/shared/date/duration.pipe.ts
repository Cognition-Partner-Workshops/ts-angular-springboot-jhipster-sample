import { Pipe, PipeTransform } from '@angular/core';

import dayjs from 'dayjs/esm';

@Pipe({
  name: 'duration',
})
/** Pipe that converts a duration value into a human-readable string (e.g. '2 hours'). */
export default class DurationPipe implements PipeTransform {
  transform(value: any): string {
    if (value) {
      return dayjs.duration(value).humanize();
    }
    return '';
  }
}
