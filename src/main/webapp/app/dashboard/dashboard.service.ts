import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountSummary } from './dashboard.model';

// TODO(DJ-92): remove mock once /api/account-summary lands
export const ACCOUNT_SUMMARY_MOCK: AccountSummary | undefined = {
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
    return useMock && ACCOUNT_SUMMARY_MOCK ? of(ACCOUNT_SUMMARY_MOCK) : this.http.get<AccountSummary>(this.resourceUrl);
  }
}
