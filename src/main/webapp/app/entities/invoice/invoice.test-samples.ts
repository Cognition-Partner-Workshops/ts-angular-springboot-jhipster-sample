import dayjs from 'dayjs/esm';

import { IInvoice, NewInvoice } from './invoice.model';

export const sampleWithRequiredData: IInvoice = {
  id: 17167,
  number: 'INV-001',
  date: dayjs('2024-01-15'),
  dueDate: dayjs('2024-02-15'),
  amount: 2293.59,
  status: 'DRAFT',
};

export const sampleWithPartialData: IInvoice = {
  id: 18934,
  number: 'INV-002',
  date: dayjs('2024-03-01'),
  dueDate: dayjs('2024-04-01'),
  amount: 7939.53,
  status: 'SENT',
};

export const sampleWithFullData: IInvoice = {
  id: 13483,
  number: 'INV-003',
  date: dayjs('2024-06-10'),
  dueDate: dayjs('2024-07-10'),
  amount: 26580.31,
  status: 'PAID',
};

export const sampleWithNewData: NewInvoice = {
  number: 'INV-004',
  date: dayjs('2024-08-20'),
  dueDate: dayjs('2024-09-20'),
  amount: 26302.97,
  status: 'OVERDUE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
