import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, afterEach } from 'vitest';

import { DashboardService } from './dashboard.service';

describe('Dashboard Service', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should request and map the account summary payload', () => {
    const payload = {
      totalBalance: 12345.67,
      accountCount: 1,
      operationCount: 1,
      accounts: [{ id: 1, name: 'Current account', balance: 12345.67, operationCount: 1 }],
      recentOperations: [
        {
          id: 9,
          date: '2026-08-01T10:15:30Z',
          description: 'Groceries',
          amount: -54.2,
          bankAccountName: 'Current account',
        },
      ],
    };
    let result;

    service.getAccountSummary().subscribe(summary => (result = summary));

    const request = httpMock.expectOne({ method: 'GET', url: 'api/account-summary' });
    request.flush(payload);

    expect(result).toEqual(payload);
  });

  it('should map an empty account summary payload', () => {
    const payload = {
      totalBalance: 0,
      accountCount: 0,
      operationCount: 0,
      accounts: [],
      recentOperations: [],
    };
    let result;

    service.getAccountSummary().subscribe(summary => (result = summary));

    const request = httpMock.expectOne({ method: 'GET', url: 'api/account-summary' });
    request.flush(payload);

    expect(result).toEqual(payload);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
