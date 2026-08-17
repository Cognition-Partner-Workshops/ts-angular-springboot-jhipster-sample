import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map, of } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountSummary, RestAccountSummary } from './dashboard.model';

// TODO(DJ-92): Remove this mock when the endpoint lands: delete ACCOUNT_SUMMARY_MOCK and the useMock parameter.
// Update dashboard.spec.ts from getSummary(false) to getSummary().
export const ACCOUNT_SUMMARY_MOCK: RestAccountSummary = {
  totalBalance: 12345.67,
  accountCount: 2,
  operationCount: 3,
  accounts: [
    { id: 1, name: 'Current account', balance: 4200, operationCount: 2 },
    { id: 2, name: 'Savings account', balance: 8145.67, operationCount: 1 },
  ],
  recentOperations: [
    { id: 3, date: '2026-08-01T10:15:30Z', description: 'Groceries', amount: -54.2, bankAccountName: 'Current account' },
    { id: 2, date: '2026-07-30T08:00:00Z', description: 'Salary', amount: 2500, bankAccountName: 'Current account' },
    { id: 1, date: '2026-07-28T12:30:00Z', description: null, amount: -20, bankAccountName: null },
  ],
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/account-summary');

  getSummary(useMock = true): Observable<AccountSummary> {
    return useMock
      ? of(this.convertFromServer(ACCOUNT_SUMMARY_MOCK))
      : this.http.get<RestAccountSummary>(this.resourceUrl).pipe(map(response => this.convertFromServer(response)));
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
