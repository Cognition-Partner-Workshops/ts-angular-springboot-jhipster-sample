import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProcessMetrics } from 'app/admin/metrics/metrics.model';

@Component({
  selector: 'jhi-metrics-system',
  templateUrl: './metrics-system.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbModule, DecimalPipe, DatePipe],
})
/** Displays system CPU, process uptime, and file descriptor metrics. */
export class MetricsSystem {
  /** System and process-level metrics. */
  systemMetrics = input<ProcessMetrics>();

  /** Whether metrics are currently being refreshed. */
  updating = input<boolean>();

  /** Converts milliseconds to a human-readable duration string (e.g. '2 days 3 hours'). */
  convertMillisecondsToDuration(ms: number): string {
    const times = {
      year: 31557600000,
      month: 2629746000,
      day: 86400000,
      hour: 3600000,
      minute: 60000,
      second: 1000,
    };
    let timeString = '';
    for (const [key, value] of Object.entries(times)) {
      if (Math.floor(ms / value) > 0) {
        let plural = '';
        if (Math.floor(ms / value) > 1) {
          plural = 's';
        }
        timeString += `${Math.floor(ms / value).toString()} ${key}${plural} `;
        ms = ms - value * Math.floor(ms / value);
      }
    }
    return timeString;
  }
}
