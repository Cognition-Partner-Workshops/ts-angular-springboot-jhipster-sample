import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { TransferService } from './transfer.service';

describe('TransferService', () => {
  let service: TransferService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TransferService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service methods', () => {
    it('should create a transfer', () => {
      const transfer = {
        id: null,
        amount: 500,
        sourceAccount: { id: 1 },
        destinationAccount: { id: 2 },
        description: 'Test',
      };

      service.create(transfer as any).subscribe(res => {
        expect(res.body).toBeTruthy();
      });

      const req = httpMock.expectOne(service['resourceUrl']);
      expect(req.request.method).toBe('POST');
      req.flush({ ...transfer, id: 1 });
    });

    it('should find a transfer by id', () => {
      service.find(1).subscribe(res => {
        expect(res.body?.id).toBe(1);
      });

      const req = httpMock.expectOne(`${service['resourceUrl']}/1`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 1, amount: 100 });
    });

    it('should query transfers with pagination', () => {
      service.query({ page: 0, size: 20, sort: ['date,desc'] }).subscribe(res => {
        expect(res.body?.length).toBeGreaterThanOrEqual(0);
      });

      const req = httpMock.expectOne(request => request.url === service['resourceUrl']);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should query transfers by account id', () => {
      service.queryByAccount(1, { page: 0, size: 10, sort: ['date,desc'] }).subscribe(res => {
        expect(res.body?.length).toBeGreaterThanOrEqual(0);
      });

      const req = httpMock.expectOne(request => request.url === `${service['resourceUrl']}/by-account/1`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
