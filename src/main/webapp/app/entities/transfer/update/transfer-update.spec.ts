import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBan, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { TransferUpdate } from './transfer-update';
import { TransferService } from '../service/transfer.service';
import { BankAccountService } from 'app/entities/bank-account/service/bank-account.service';

describe('TransferUpdate Component', () => {
  let comp: TransferUpdate;
  let fixture: ComponentFixture<TransferUpdate>;
  let transferService: TransferService;
  let bankAccountService: BankAccountService;

  const mockAccounts = [
    { id: 1, name: 'Checking', balance: 1000 },
    { id: 2, name: 'Savings', balance: 500 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferUpdate, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faBan);
    library.addIcons(faExchangeAlt);

    fixture = TestBed.createComponent(TransferUpdate);
    comp = fixture.componentInstance;
    transferService = TestBed.inject(TransferService);
    bankAccountService = TestBed.inject(BankAccountService);

    vitest.spyOn(bankAccountService, 'query').mockReturnValue(of(new HttpResponse({ body: mockAccounts })));
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should load bank accounts on init', () => {
    comp.ngOnInit();
    expect(comp.bankAccounts().length).toBe(2);
  });

  it('should filter destination accounts when source is selected', () => {
    comp.ngOnInit();
    comp.editForm.get('sourceAccount')?.setValue(mockAccounts[0]);
    expect(comp.filteredDestinationAccounts().length).toBe(1);
    expect(comp.filteredDestinationAccounts()[0].id).toBe(2);
  });

  it('should prevent invalid form submission', () => {
    comp.ngOnInit();
    expect(comp.editForm.invalid).toBe(true);
  });

  it('should validate amount is positive', () => {
    comp.editForm.get('amount')?.setValue(-5);
    expect(comp.editForm.get('amount')?.errors?.min).toBeTruthy();
  });
});
