import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { Level, LoggersResponse } from './log.model';

/** Service for reading and modifying application log levels via Spring Boot Actuator. */
@Injectable({ providedIn: 'root' })
export class LogsService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Changes the log level for a specific logger at runtime. */
  changeLevel(name: string, configuredLevel: Level): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`management/loggers/${name}`), { configuredLevel });
  }

  /** Fetches all loggers and their current levels. */
  findAll(): Observable<LoggersResponse> {
    return this.http.get<LoggersResponse>(this.applicationConfigService.getEndpointFor('management/loggers'));
  }
}
