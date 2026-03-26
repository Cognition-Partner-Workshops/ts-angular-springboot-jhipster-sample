import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { GarbageCollector } from 'app/admin/metrics/metrics.model';
import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-metrics-garbagecollector',
  templateUrl: './metrics-garbagecollector.html',
  imports: [NgbModule, DecimalPipe, TranslateDirective, TranslateModule],
})
/** Displays JVM garbage collector pause counts and total pause time. */
export class MetricsGarbageCollector {
  /** GC metrics including collection count and cumulative pause time. */
  garbageCollectorMetrics = input<GarbageCollector>();

  /** Whether metrics are currently being refreshed. */
  updating = input<boolean>();
}
