import { IInvoice, NewInvoice } from './invoice.model';

export const sampleWithRequiredData: IInvoice = {
  id: 12345,
  number: 'INV-0001',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  amount: 1500.0,
  status: 'DRAFT',
};

export const sampleWithPartialData: IInvoice = {
  id: 23456,
  number: 'INV-0002',
  date: '2024-02-20',
  dueDate: '2024-03-20',
  amount: 2750.5,
  status: 'SENT',
};

export const sampleWithFullData: IInvoice = {
  id: 34567,
  number: 'INV-0003',
  date: '2024-03-10',
  dueDate: '2024-04-10',
  amount: 890.75,
  status: 'PAID',
};

export const sampleWithNewData: NewInvoice = {
  number: 'INV-0004',
  date: '2024-04-01',
  dueDate: '2024-05-01',
  amount: 3200.0,
  status: 'DRAFT',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
