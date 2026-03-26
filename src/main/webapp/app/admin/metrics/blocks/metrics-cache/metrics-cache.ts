import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { CacheMetrics } from 'app/admin/metrics/metrics.model';
import { filterNaN } from 'app/core/util/operators';
import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-metrics-cache',
  templateUrl: './metrics-cache.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KeyValuePipe, DecimalPipe, TranslateDirective, TranslateModule],
})
/** Displays Ehcache hit/miss/eviction statistics per cache region. */
export class MetricsCache {
  /** Cache metrics keyed by cache region name. */
  cacheMetrics = input<Record<string, CacheMetrics>>();

  /** Whether metrics are currently being refreshed. */
  updating = input<boolean>();

  filterNaN = (n: number): number => filterNaN(n);
}
