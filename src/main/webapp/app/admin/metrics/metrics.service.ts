import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { MetricsModel, ThreadDump } from './metrics.model';

/** Service that fetches application metrics and thread dumps from Spring Boot Actuator. */
@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Fetches aggregated JVM, HTTP, cache, and database metrics. */
  getMetrics(): Observable<MetricsModel> {
    return this.http.get<MetricsModel>(this.applicationConfigService.getEndpointFor('management/jhimetrics'));
  }

  /** Fetches the current JVM thread dump for diagnostics. */
  threadDump(): Observable<ThreadDump> {
    return this.http.get<ThreadDump>(this.applicationConfigService.getEndpointFor('management/threaddump'));
  }
}
