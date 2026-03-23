import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ITransfer } from '../transfer.model';
import { TransferService } from './transfer.service';

describe('Transfer Service', () => {
  let service: TransferService;
  let httpMock: HttpTestingController;
  let expectedResult: ITransfer | ITransfer[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TransferService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find a Transfer', () => {
      const returnedFromService = { id: 123, amount: 500, description: 'Test' };
      const expected = { id: 123, amount: 500, description: 'Test' };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Transfer', () => {
      const transfer = { id: null, amount: 500, description: 'Test', sourceAccount: { id: 1 }, destinationAccount: { id: 2 } };
      const returnedFromService = { id: 123, amount: 500, description: 'Test' };
      const expected = { id: 123, amount: 500, description: 'Test' };

      service.create(transfer).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Transfers', () => {
      const returnedFromService = { id: 123, amount: 500, description: 'Test' };
      const expected = { id: 123, amount: 500, description: 'Test' };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should return transfers by account', () => {
      const returnedFromService = { id: 123, amount: 500, description: 'Test' };
      const expected = { id: 123, amount: 500, description: 'Test' };

      service.queryByAccount(1).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
