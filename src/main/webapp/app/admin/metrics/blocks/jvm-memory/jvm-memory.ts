import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { JvmMetrics } from 'app/admin/metrics/metrics.model';
import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-jvm-memory',
  templateUrl: './jvm-memory.html',
  imports: [NgbModule, KeyValuePipe, DecimalPipe, TranslateDirective, TranslateModule],
})
/** Displays JVM memory pool usage (heap and non-heap) with progress bars. */
export class JvmMemory {
  /** JVM memory metrics keyed by pool name (e.g. 'PS Eden Space'). */
  jvmMemoryMetrics = input<Record<string, JvmMetrics>>();

  /** Whether metrics are currently being refreshed. */
  updating = input<boolean>();
}
