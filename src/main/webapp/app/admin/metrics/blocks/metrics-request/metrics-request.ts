import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { HttpServerRequests } from 'app/admin/metrics/metrics.model';
import { filterNaN } from 'app/core/util/operators';
import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-metrics-request',
  templateUrl: './metrics-request.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbModule, KeyValuePipe, DecimalPipe, TranslateDirective, TranslateModule],
})
/** Displays HTTP request metrics grouped by response status code. */
export class MetricsRequest {
  /** HTTP server request metrics with per-status-code breakdown. */
  requestMetrics = input<HttpServerRequests>();

  /** Whether metrics are currently being refreshed. */
  updating = input<boolean>();

  filterNaN = (n: number): number => filterNaN(n);
}
