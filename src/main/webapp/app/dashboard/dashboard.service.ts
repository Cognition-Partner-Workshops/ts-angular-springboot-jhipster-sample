import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountSummary, RestAccountSummary } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/account-summary');

  getSummary(): Observable<AccountSummary> {
    return this.http.get<RestAccountSummary>(this.resourceUrl).pipe(map(response => this.convertFromServer(response)));
  }

  protected convertDateFromServer(date: string): dayjs.Dayjs {
    return dayjs(date);
  }

  protected convertFromServer(restSummary: RestAccountSummary): AccountSummary {
    return {
      ...restSummary,
      recentOperations: restSummary.recentOperations.map(operation => ({
        ...operation,
        date: this.convertDateFromServer(operation.date),
      })),
    };
  }
}
