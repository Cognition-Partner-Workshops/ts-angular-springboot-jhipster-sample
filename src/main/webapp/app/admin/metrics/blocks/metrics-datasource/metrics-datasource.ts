import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { Databases } from 'app/admin/metrics/metrics.model';
import { filterNaN } from 'app/core/util/operators';
import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-metrics-datasource',
  templateUrl: './metrics-datasource.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, TranslateDirective, TranslateModule],
})
/** Displays HikariCP connection pool statistics (active, idle, pending). */
export class MetricsDatasource {
  /** Database connection pool metrics. */
  datasourceMetrics = input<Databases>();

  /** Whether metrics are currently being refreshed. */
  updating = input<boolean>();

  filterNaN = (n: number): number => filterNaN(n);
}
