import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import dayjs from 'dayjs/esm';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import Dashboard from './dashboard';
import { AccountSummary, RestAccountSummary } from './dashboard.model';
import { DashboardService } from './dashboard.service';

const populatedRestSummary: RestAccountSummary = {
  totalBalance: 12345.67,
  accountCount: 1,
  operationCount: 1,
  accounts: [{ id: 1, name: 'Current account', balance: 10000, operationCount: 1 }],
  recentOperations: [{ id: 1, date: '2026-08-01T10:15:30Z', description: 'Groceries', amount: -54.2, bankAccountName: 'Current account' }],
};

const populatedSummary: AccountSummary = {
  ...populatedRestSummary,
  recentOperations: populatedRestSummary.recentOperations.map(operation => ({ ...operation, date: dayjs(operation.date) })),
};

const emptySummary: AccountSummary = {
  totalBalance: 0,
  accountCount: 0,
  operationCount: 0,
  accounts: [],
  recentOperations: [],
};

describe('Dashboard Service', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClientTesting()] });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should retrieve the account summary contract', () => {
    service.getSummary(false).subscribe(summary => {
      expect(summary.totalBalance).toBe(12345.67);
      expect(summary.accountCount).toBe(1);
      expect(summary.operationCount).toBe(1);
      expect(summary.recentOperations[0].date).toEqual(dayjs('2026-08-01T10:15:30Z'));
    });

    const request = httpMock.expectOne({ method: 'GET', url: 'api/account-summary' });
    request.flush(populatedRestSummary);
    httpMock.verify();
  });
});

describe('Dashboard Component', () => {
  let fixture: ComponentFixture<Dashboard>;
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: DashboardService,
          useValue: {
            getSummary: () => of(populatedSummary),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(Dashboard);
    service = TestBed.inject(DashboardService);
  });

  it('should render populated account and operation summaries', () => {
    fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    const renderedText = fixture.nativeElement.textContent;
    expect(renderedText).toContain('$12,345.67');
    expect(renderedText).toContain('Current account');
    expect(renderedText).toContain('$10,000.00');
    expect(renderedText).toContain('Groceries');
    expect(renderedText).toContain('-$54.20');
  });

  it('should render empty states when the summary has no data', () => {
    service.getSummary = () => of(emptySummary);
    fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#no-accounts')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#no-operations')).not.toBeNull();
  });
});
