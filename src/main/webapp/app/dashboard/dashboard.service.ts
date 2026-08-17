import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IAccountSummary } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/account-summary');

  getAccountSummary(): Observable<IAccountSummary> {
    return this.http.get<IAccountSummary>(this.resourceUrl);
  }
}
