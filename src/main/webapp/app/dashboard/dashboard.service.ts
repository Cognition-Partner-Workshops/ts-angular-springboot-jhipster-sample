import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IAccountSummary } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/account-summary');

  getAccountSummary(useMock = true): Observable<IAccountSummary> {
    // TODO: remove mock
    const MOCK_ACCOUNT_SUMMARY: IAccountSummary = {
      totalBalance: 12750.45,
      accountCount: 3,
      operationCount: 5,
      accounts: [
        { id: 1, name: 'Current account', balance: 8450.25, operationCount: 3 },
        { id: 2, name: 'Savings account', balance: 3900.2, operationCount: 1 },
        { id: 3, name: 'Travel account', balance: 400, operationCount: 1 },
      ],
      recentOperations: [
        { id: 5, date: '2026-08-01T10:15:30Z', description: 'Groceries', amount: -54.2, bankAccountName: 'Current account' },
        { id: 4, date: '2026-07-31T15:45:00Z', description: 'Salary', amount: 3200, bankAccountName: 'Current account' },
        { id: 3, date: '2026-07-29T09:20:00Z', description: 'Hotel booking', amount: -280.5, bankAccountName: 'Travel account' },
        { id: 2, date: '2026-07-25T18:05:12Z', description: 'Transfer to savings', amount: 1000, bankAccountName: 'Savings account' },
        { id: 1, date: '2026-07-20T12:30:00Z', description: 'Coffee shop', amount: -4.75, bankAccountName: 'Current account' },
      ],
    };
    if (useMock) return of(MOCK_ACCOUNT_SUMMARY);
    return this.http.get<IAccountSummary>(this.resourceUrl);
  }
}
