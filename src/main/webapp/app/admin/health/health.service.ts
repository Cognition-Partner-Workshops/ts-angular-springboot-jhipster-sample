import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { HealthModel } from './health.model';

/** Service that fetches application health status from Spring Boot Actuator. */
@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Calls the `/management/health` endpoint to check component statuses. */
  checkHealth(): Observable<HealthModel> {
    return this.http.get<HealthModel>(this.applicationConfigService.getEndpointFor('management/health'));
  }
}
