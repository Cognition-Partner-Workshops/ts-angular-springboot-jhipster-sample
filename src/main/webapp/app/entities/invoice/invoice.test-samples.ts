import dayjs from 'dayjs/esm';

import { IInvoice, NewInvoice } from './invoice.model';

export const sampleWithRequiredData: IInvoice = {
  id: 28734,
  number: 'INV-001',
  date: dayjs('2024-01-15'),
  dueDate: dayjs('2024-02-15'),
  amount: 1500.5,
  status: 'DRAFT',
};

export const sampleWithPartialData: IInvoice = {
  id: 15923,
  number: 'INV-002',
  date: dayjs('2024-03-01'),
  dueDate: dayjs('2024-04-01'),
  amount: 2500.0,
  status: 'SENT',
};

export const sampleWithFullData: IInvoice = {
  id: 19834,
  number: 'INV-003',
  date: dayjs('2024-06-10'),
  dueDate: dayjs('2024-07-10'),
  amount: 9999.99,
  status: 'PAID',
};

export const sampleWithNewData: NewInvoice = {
  number: 'INV-NEW',
  date: dayjs('2024-08-20'),
  dueDate: dayjs('2024-09-20'),
  amount: 500.0,
  status: 'DRAFT',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
