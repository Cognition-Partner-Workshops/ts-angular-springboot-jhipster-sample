import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, beforeEach, it } from 'vitest';

import Dashboard from './dashboard';
import { AccountSummary } from './dashboard.model';
import { DashboardService } from './dashboard.service';

const populatedSummary: AccountSummary = {
  totalBalance: 12345.67,
  accountCount: 1,
  operationCount: 1,
  accounts: [{ id: 1, name: 'Current account', balance: 12345.67, operationCount: 1 }],
  recentOperations: [{ id: 1, date: '2026-08-01T10:15:30Z', description: 'Groceries', amount: -54.2, bankAccountName: 'Current account' }],
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
    service.getSummary(false).subscribe(summary => expect(summary).toEqual(populatedSummary));

    const request = httpMock.expectOne({ method: 'GET', url: 'api/account-summary' });
    request.flush(populatedSummary);
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

    expect(fixture.nativeElement.textContent).toContain('Current account');
    expect(fixture.nativeElement.textContent).toContain('Groceries');
    expect(fixture.nativeElement.textContent).toContain('1');
  });

  it('should render empty states when the summary has no data', () => {
    service.getSummary = () => of(emptySummary);
    fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#no-accounts')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#no-operations')).not.toBeNull();
  });
});
