import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { Services } from 'app/admin/metrics/metrics.model';

@Component({
  selector: 'jhi-metrics-endpoints-requests',
  templateUrl: './metrics-endpoints-requests.html',
  imports: [KeyValuePipe, DecimalPipe],
})
/** Displays per-endpoint HTTP request counts and average response times. */
export class MetricsEndpointsRequests {
  /** Endpoint-level request metrics grouped by service. */
  endpointsRequestsMetrics = input<Services>();

  /** Whether metrics are currently being refreshed. */
  updating = input<boolean>();
}
