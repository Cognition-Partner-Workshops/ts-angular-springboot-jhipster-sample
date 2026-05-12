import dayjs from 'dayjs/esm';

import { IInvoice, NewInvoice } from './invoice.model';

export const sampleWithRequiredData: IInvoice = {
  id: 17167,
  number: 'INV-001',
  date: dayjs('2024-01-15'),
  dueDate: dayjs('2024-02-15'),
  amount: 1500.0,
  status: 'DRAFT',
};

export const sampleWithPartialData: IInvoice = {
  id: 18934,
  number: 'INV-002',
  date: dayjs('2024-02-20'),
  dueDate: dayjs('2024-03-20'),
  amount: 2300.5,
  status: 'SENT',
};

export const sampleWithFullData: IInvoice = {
  id: 13483,
  number: 'INV-003',
  date: dayjs('2024-03-10'),
  dueDate: dayjs('2024-04-10'),
  amount: 750.0,
  status: 'PAID',
  bankAccount: { id: 1, name: 'Test Account', balance: 1000 },
};

export const sampleWithNewData: NewInvoice = {
  number: 'INV-004',
  date: dayjs('2024-04-05'),
  dueDate: dayjs('2024-05-05'),
  amount: 4200.75,
  status: 'OVERDUE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
